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
import { IDbPerson, Role } from "../db/DbPerson";

export class DevCommand implements ICommand {
    public readonly prefixes = ["dev"];

    public async run(conference: Conference, client: MatrixClient, roomId: string) {
        const people: IDbPerson[] = [];
        for (const aud of conference.storedAuditoriums) {
            const inviteTargets = await conference.getInviteTargetsForAuditorium(aud, true);
            people.push(...inviteTargets.filter(i => i.event_role === Role.Coordinator));
        }
        const newPeople: IDbPerson[] = [];
        for (const p of people) {
            if (!newPeople.some(n => n.person_id == p.person_id)) {
                newPeople.push(p);
            }
        }
        await client.sendNotice(roomId, `Total people: ${newPeople.length}`);
    }
}
