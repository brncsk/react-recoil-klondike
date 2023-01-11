# `react-recoil-klondike`

<center>
<img width="100%" align="center" alt="image" src="https://user-images.githubusercontent.com/1205180/211818529-96ab27a1-bbcc-4782-9f8d-914033c8ab73.png">
</center>

## Description

`react-recoil-klondike` is an implementation of the classic [Klondike solitaire](<https://en.wikipedia.org/wiki/Klondike_(solitaire)>) game using [React](https://reactjs.org/) + [Recoil](https://recoiljs.org/).

It's a sufficiently complex but still self-contained example of a React application that uses Recoil for state management. See [Architectural decisions](#architectural-decisions) for more details.

The game is available at https://react-recoil-klondike.netlify.app/.

## Usage

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Architectural decisions

Some of the goals/conclusions I've had while working on this project:

### No images (well, almost)

Other than the icons on the HUD's buttons, the game is implemented using only CSS and HTML. No images are used. See [`src/styles`](src/styles) for more details.

Still, there are some visual goodies, including a backface pattern for the cards,
nice fonts, subtle shadows and gradients, and a playful animation when the game is won.

The pattern is &copy; [Lea Verou](https://projects.verou.me/css3patterns/).\
Fonts are &copy; [Google Fonts](https://fonts.google.com/).

### No `react-dnd`, no HTML5 drag-and-drop

HTML5 drag-and-drop (and transitively, `react-dnd`) was deemed both needlessly
complex and performance-wise suboptimal for this use case. Instead, the game
uses a custom drag-and-drop implementation based on [pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) and CSS transforms. See
[`src/hooks/drag-and-drop.ts`](src/hooks/drag-and-drop.ts) for more details.

For the sake of performance, the game avoids react re-renders during
drag-and-drop operations. Details of the in-flight drag are communicated via
[custom events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events),
[data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes)
and React [refs](https://reactjs.org/docs/hooks-reference.html#useref).

### Explicit positioning

While the game relies on the browser's layout engine to position the stacks using
CSS grid, the cards are not rendered inside the stacks. Instead, they are
positioned explicitly using a custom algorithm. See
[`src/hooks/cards.ts`](src/hooks/cards.ts) for more details.

This is done to avoid detaching and re-attaching the cards to the DOM during
drag-and-drop operations. This would cause the browser to re-render both stacks
and cards, which would lead to janky animations.
