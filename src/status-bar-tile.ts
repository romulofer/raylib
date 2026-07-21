export type RunTile = {
  element: HTMLElement;
  destroy(): void;
};

// Build the clickable status-bar element. `onRun` fires on click.
export function createRunTile(onRun: () => void): RunTile {
  const element = document.createElement('a');
  element.className = 'raylib-run inline-block';
  element.textContent = '▶ Run raylib'; // "▶ Run raylib"
  element.title = 'Build and run the raylib project';

  const clickHandler = (): void => onRun();
  element.addEventListener('click', clickHandler);

  return {
    element,
    destroy(): void {
      element.removeEventListener('click', clickHandler);
      element.remove();
    }
  };
}
