/* global kontra */

import { initAudio } from '../audio/index.js';
import { Bombs } from '../bomb/index.js';
import { createLoop } from '../loop/index.js';
import { createMap } from '../map/index.js';
import { createPlayer } from '../player/index.js';
import { Users } from '../user/index.js';
import { viruses } from '../virus/index.js';
import { createCanvas } from '../canvas/index.js';
import { initPathfinder, pathfinder } from '../pathfinder/index.js';
import { pubsub, USERS_POSSIBLY_OFFLINE } from '../pubsub/index.js';
import { messageBox } from '../messageBox/index.js';
import { servers } from '../server/index.js';
import getLevel from '../level/getLevel.js';
import initScoreBoard from '../scoreBoard/index.js';

class GameManager {
    constructor() {
        createCanvas();
        kontra.init();
        initPathfinder();
        initAudio();
    }

    async initLevel(levelIndex) {
        const level = getLevel(levelIndex);
        const map = await createMap({ ...level.map, col: level.player.col, row: level.player.row });
        this.player = createPlayer({ map, ...level.player });
        const bombs = new Bombs(map);
        viruses.init(map, level.virus);
        pathfinder.setDataFromMap(map, 'main');
        const users = new Users({ map });
        servers.init(map, level.servers);
        this.loop = createLoop({ map, player: this.player, users, bombs });
        pubsub.reset(USERS_POSSIBLY_OFFLINE, () => users.updateOnlineStatus());
        initScoreBoard({ users, map });

        map.render();
        users.render();
        servers.render();
        bombs.render();
        this.player.render();
    }

    showStartScreen() {
        messageBox.show(
            'welcome, <span class="grn">captain katamov!</span><br><br>' +
                'Your shift as chief network security officers is about to begin… all users are online and happy. ' +
                'in case of virus intrusion, <span class="grn">cut them off</span> from the network ' +
                "to make sure they don't get infected!<br><br>" +
                '<table><tr><td class="grn">arrow keys</td><td>…</td><td>change direction</td></tr>' +
                '<tr><td class="grn">space bar</td><td>…</td><td>drop bomb</td></tr>' +
                '<tr><td class="grn">return</td><td>…</td><td>teleport to server</td></tr>' +
                '</table><br>press any key to begin!'
        );
        document.addEventListener(
            'keydown',
            () => {
                messageBox.clear();
                this.startLevel();
                setTimeout(() => this.player.enableControls(), 500);
            },
            { once: true }
        );
    }

    startLevel() {
        this.loop.start();
        viruses.startSpawning();
    }
}

export default new GameManager();
