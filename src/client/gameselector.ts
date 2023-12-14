import { Slug } from '../common/slug';
import { MetaGame } from '../common/types';
import { navigate, getLocationSlug } from './navigation';
import { notify } from './notices';

export class GameSelector {
    dialogBox: HTMLDialogElement;
    closeButton: HTMLButtonElement;
    openButton: HTMLButtonElement;

    constructor() {
        // Grab the elements we'll be using
        this.dialogBox = document.querySelector<HTMLDialogElement>('#gameSelector');
        this.closeButton = document.querySelector<HTMLButtonElement>('#gameSelector .close');
        this.openButton = document.querySelector<HTMLButtonElement>('.show-game-selector');

        // Hook up the button events
        this.closeButton.addEventListener('click', () => this.hide());
        this.openButton.addEventListener('click', () => this.show());
    }

    /**
     * Opens the Game Selector
     * @param closeable Whether or not to display the close button
     */
    show(closeable = true) {
        this.closeButton.style.display = closeable ? 'block' : 'none';
        this.dialogBox.showModal();
    }

    /**
     * Closes the Game Selector
     */
    hide() {
        this.dialogBox.close();
        this.closeButton.style.display = '';
    }

    /**
     * Populates the Game Selector with buttons
     * @param games List of available games
     */
    regenerate(games: { [game: string]: MetaGame }) {
        // Grab and clear the selector container
        const container = document.querySelector('#gameSelector .games');
        container.innerHTML = '';

        // Generate a button for each game
        for (const game of Object.values(games)) {
            const btn = document.createElement('button');
            btn.classList.add('game-selector', 'btn');
            btn.onclick = () => {
                this.switchGame(game.id);
            };

            const icon = document.createElement('img');
            icon.src = game.icon;
            icon.classList.add('icon');
            icon.style.background = game.color;

            btn.append(icon);

            const name = document.createElement('span');
            name.innerText = game.name;

            btn.append(name);

            container.append(btn);
        }
    }

    private async switchGame(game: string) {
        this.hide();

        try {
            // Get the current location, change the game, and try to navigate to it
            const l: Slug = getLocationSlug();
            l.game = game;
            await navigate(l);
        } catch {
            // Failed to navigate! Let's just head back to the game's home page then
            await navigate(new Slug(game));
            notify('This page does not exist for this game, so we put you on the homepage.', 'file-document-remove');
        }
    }
}
