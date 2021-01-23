/*
Copyright 2021 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import "./common.scss";

import { joinConference } from "./jitsi";
import { VideoConferenceCapabilities, WidgetApi } from "matrix-widget-api";
import { makeLivestream, pause, play, videoEl } from "./hls";
import { addlQuery, isWidget, widgetId } from "./widgets";

const messagesEl = document.getElementById("messages");
const controlsEl = document.getElementById("controlBar");
const jitsiContainer = document.getElementById("jitsiContainer");
const jitsiUnderlay = document.getElementById("jitsiUnderlay");
const liveWarning = document.getElementById("liveBanner");
const joinButton = document.getElementById('joinButton');

let widgetApi: WidgetApi = null;

// Start widget API as early as possible
if (widgetId) {
    (async function () {
        widgetApi = new WidgetApi(widgetId);
        widgetApi.requestCapabilities(VideoConferenceCapabilities);
        widgetApi.start();
        await new Promise<void>(resolve => {
            widgetApi.once("ready", () => resolve());
        });
        await widgetApi.setAlwaysOnScreen(false);
    })();
}


messagesEl.style.display = 'block';
if (isWidget) {
    controlsEl.style.display = 'block';
}

makeLivestream(() => showVideo());

function showVideo(ready = false) {
    if (widgetApi) widgetApi.setAlwaysOnScreen(false);
    jitsiContainer.style.display = 'none';
    jitsiUnderlay.style.display = 'none';
    messagesEl.style.display = ready ? 'none' : 'block';
    videoEl.style.display = ready ? 'block' : 'none';
    liveWarning.style.display = 'none';
    if (isWidget) {
        controlsEl.style.display = 'block';
    }
}

function showJitsi() {
    pause();
    if (widgetApi) widgetApi.setAlwaysOnScreen(true);
    jitsiContainer.style.display = 'block';
    jitsiUnderlay.style.display = 'block';
    messagesEl.style.display = 'none';
    videoEl.style.display = 'none';
    controlsEl.style.display = 'none';
    liveWarning.style.display = 'block';
}

function onJitsiEnd() {
    showVideo();
    play(() => showVideo(true));
}

const jitsiOpts = {
    conferenceId: Array.from(document.getElementsByTagName('meta'))
        .find(t => t.name === 'org.matrix.confbot.conf_id')
        .getAttribute('content'),
    conferenceDomain: Array.from(document.getElementsByTagName('meta'))
        .find(t => t.name === 'org.matrix.confbot.conf_domain')
        .getAttribute('content'),
    title: Array.from(document.getElementsByTagName('meta'))
        .find(t => t.name === 'org.matrix.confbot.conf_name')
        .getAttribute('content'),
    displayName: addlQuery["displayName"],
    avatarUrl: addlQuery["avatarUrl"],
    userId: addlQuery["userId"],
    roomId: addlQuery["roomId"],
    auth: addlQuery["auth"],
}

joinButton.addEventListener('click', () => {
    showJitsi();
    joinConference(jitsiOpts, widgetApi, () => onJitsiEnd());
});
