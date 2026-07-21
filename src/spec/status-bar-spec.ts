import * as path from 'path';
import { createRunTile } from '../status-bar-tile';
import { isRaylibProject } from '../detect';

describe('run button', () => {
  describe('createRunTile', () => {
    it('builds a clickable element that fires onRun', () => {
      let clicks = 0;
      const tile = createRunTile(() => { clicks += 1; });
      expect(tile.element.textContent).toContain('Run');
      tile.element.click();
      expect(clicks).toBe(1);
    });

    it('stops firing after destroy', () => {
      let clicks = 0;
      const tile = createRunTile(() => { clicks += 1; });
      tile.destroy();
      tile.element.click();
      expect(clicks).toBe(0);
    });
  });

  describe('consumeStatusBar', () => {
    it('adds a right tile for a raylib project', async () => {
      const pkg = (await (atom as any).packages.activatePackage('raylib')).mainModule;
      const projectRoot = path.join(__dirname, 'fixtures', 'raylib-project');
      // Sanity: the fixture is detected as a raylib project.
      expect(isRaylibProject(projectRoot)).toBe(true);
      (atom as any).project.setPaths([projectRoot]);

      let added: any = null;
      const fakeStatusBar = {
        addRightTile: (opts: any) => {
          added = opts;
          return { destroy() {} };
        }
      };
      pkg.consumeStatusBar(fakeStatusBar);

      expect(added).toBeTruthy();
      expect(added.item instanceof HTMLElement).toBe(true);
      await (atom as any).packages.deactivatePackage('raylib');
    });

    it('adds no tile when the project does not use raylib', async () => {
      const pkg = (await (atom as any).packages.activatePackage('raylib')).mainModule;
      (atom as any).project.setPaths([path.join(__dirname, 'fixtures', 'plain-project')]);

      let added = false;
      pkg.consumeStatusBar({ addRightTile: () => { added = true; return { destroy() {} }; } });

      expect(added).toBe(false);
      await (atom as any).packages.deactivatePackage('raylib');
    });
  });
});
