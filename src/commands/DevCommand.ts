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

import { ICommand } from "./ICommand";
import { MatrixClient } from "matrix-bot-sdk";
import { Conference } from "../Conference";
import config from "../config";
import { ScheduledTaskType } from "../Scheduler";

export class DevCommand implements ICommand {
    public readonly prefixes = ["dev"];

    public async run(conference: Conference, client: MatrixClient, roomId: string, event: any, args: string[]) {
        const db = await conference.getPentaDb();
        const upcomingTalks = await db.getUpcomingTalkStarts(5, 5);
        const upcomingQA = await db.getUpcomingQAStarts(5, 5);
        const upcomingEnds = await db.getUpcomingTalkEnds(5, 5);

        upcomingTalks.forEach(e => config.RUNTIME.scheduler.tryScheduleTask(ScheduledTaskType.TalkStart, e));
        upcomingQA.forEach(e => config.RUNTIME.scheduler.tryScheduleTask(ScheduledTaskType.TalkQA, e));
        upcomingEnds.forEach(e => config.RUNTIME.scheduler.tryScheduleTask(ScheduledTaskType.TalkEnd, e));
    }
}
