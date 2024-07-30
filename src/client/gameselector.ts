import { Slug } from '../common/slug';
import { MenuGame } from '../common/types';
import { navigate, getLocationSlug } from './navigation';
import { notify } from './notices';

export class GameSelector {
    element: HTMLButtonElement;
    gameListElement: HTMLDivElement;

    constructor() {
        // Grab the elements we'll be using
        this.element = document.querySelector<HTMLButtonElement>('#game-selector');
        this.gameListElement = this.element.querySelector('.game-list');

        // Bind relevant events
        window.addEventListener('click', (event) => {
            if (!(event.target instanceof HTMLElement)) return;
            if (event.target === this.element || event.target === this.element.firstElementChild) return this.toggle();
            if (this.element.contains(event.target)) return;
            this.hide();
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') this.hide();
        });
    }

    /**
     * Opens the Game Selector
     */
    show() {
        this.gameListElement.classList.add('active');
    }

    /**
     * Closes the Game Selector
     */
    hide() {
        this.gameListElement.classList.remove('active');
    }

    /**
     * Toggles the Game Selector
     */
    toggle() {
        this.gameListElement.classList.toggle('active');
    }

    /**
     * Populates the Game Selector with buttons
     * @param games List of available games
     */
    regenerate(games: { [game: string]: MenuGame }) {
        // Clear the current list
        this.gameListElement.replaceChildren();

        // Generate a button for each game
        for (const [gameID, game] of Object.entries(games)) {
            const btn = document.createElement('button');
            btn.setAttribute('game', gameID);
            btn.onclick = () => this.switchGame(gameID);
            btn.classList.add('game-entry', 'btn');

            const icon = document.createElement('img');
            icon.classList.add('icon');
            icon.src = game.icon;
            icon.style.background = game.color;
            btn.append(icon);

            const name = document.createElement('span');
            name.textContent = game.name;
            btn.append(name);

            this.gameListElement.append(btn);
        }

        this.updateSelected();
    }

    updateSelected() {
        // Get currently-selected game
        const currentGame = getLocationSlug().game;

        // Update elements' classes
        for (const entry of this.gameListElement.children) {
            entry.classList.toggle('current-game', entry.getAttribute('game') === currentGame);
        }
    }

    private async switchGame(game: string) {
        this.hide();

        try {
            // Get the current location, change the game, and try to navigate to it
            const l: Slug = getLocationSlug();
            l.game = game;
            await navigate(l);
            this.updateSelected();
        } catch {
            // Failed to navigate! Let's just head back to the game's home page then
            await navigate(new Slug(game));
            notify('This page does not exist for this game, so we put you on the homepage.', 'file-document-remove');
        }
    }
}
