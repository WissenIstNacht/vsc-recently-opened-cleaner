import * as fs from 'fs';
import { ExtensionContext, Uri, commands, window, workspace } from 'vscode';

type URI = Uri;

// The following interfaces are copied from
// https://github.com/microsoft/vscode/blob/9ff83d41a3268ec578c032ae54102285b447e947/src/vs/platform/workspaces/common/workspaces.ts#L48
export interface IRecentlyOpened {
  workspaces: IRecentFolder[];
  files: IRecentFile[];
}

export type IRecent = IRecentFolder | IRecentFile;

interface IRecentFolder {
  readonly folderUri: URI;
  label?: string;
  readonly remoteAuthority?: string;
}

interface IRecentFile {
  readonly fileUri: URI;
  label?: string;
  readonly remoteAuthority?: string;
}

export function activate(context: ExtensionContext) {
  let disposable = commands.registerCommand(
    'recently-opened-cleaner.clean-recently-opened',
    async () => {
      let recentEntries = (await commands.executeCommand(
        '_workbench.getRecentlyOpened'
      )) as IRecentlyOpened;

      const filtered = recentEntries.workspaces.filter(
        (ws) => !isRecentlyOpenedValid(ws.folderUri)
      );
      const initialEntriesCount = recentEntries.workspaces.length;
      const toDeleteCount = filtered.length;

      if (toDeleteCount === 0) {
        window.showInformationMessage(
          'No stale items found in the recently opened list.'
        );
        return;
      }

      const promptValue = await window.showInformationMessage(
        `Found ${toDeleteCount} stale item(s) in the recently opened list.`,
        { modal: true },
        ...['Delete']
      );
      console.log(promptValue);

      if (!promptValue) {
        window.showInformationMessage('Canceled deletion.');
        return;
      }

      filtered.forEach((ws) => {
        console.log('Deleting ' + ws.folderUri.toString());
        try {
          commands.executeCommand(
            'vscode.removeFromRecentlyOpened',
            ws.folderUri.fsPath
          );
        } catch (e) {
          console.error(
            'something went wrong for the folder with URI: ' +
              ws.folderUri +
              ' The error returned: ' +
              e
          );
        } finally {
          console.log('Deletion done');
        }
      });

      recentEntries = (await commands.executeCommand(
        '_workbench.getRecentlyOpened'
      )) as IRecentlyOpened;
      const newEntriesCount = recentEntries.workspaces.length;

      if (initialEntriesCount - toDeleteCount === newEntriesCount) {
        window.showInformationMessage(
          `Successfully deleted ${toDeleteCount} stale item(s) from the recently opened list.`
        );
      } else {
        window.showErrorMessage(
          `Something went wrong. Out of the ${toDeleteCount} item(s) that should have been deleted, only ${
            initialEntriesCount - newEntriesCount
          } got removed.`
        );
      }
    }
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'recently-opened-cleaner.automatically-clean-recently-opened',
    async () => {
      let recentEntries = (await commands.executeCommand(
        '_workbench.getRecentlyOpened'
      )) as IRecentlyOpened;

      const filtered = recentEntries.workspaces.filter(
        (ws) => !isRecentlyOpenedValid(ws.folderUri)
      );
      const initialEntriesCount = recentEntries.workspaces.length;
      const toDeleteCount = filtered.length;

      if (toDeleteCount === 0) {
        window.showInformationMessage(
          'No stale items found in the recently opened list.'
        );
        return;
      }

      filtered.forEach((ws) => {
        console.log('Deleting ' + ws.folderUri.toString());
        try {
          commands.executeCommand(
            'vscode.removeFromRecentlyOpened',
            ws.folderUri.fsPath
          );
        } catch (e) {
          console.error(
            'something went wrong for the folder with URI: ' +
              ws.folderUri +
              ' The error returned: ' +
              e
          );
        }
      });

      let updatedRecentEntries = (await commands.executeCommand(
        '_workbench.getRecentlyOpened'
      )) as IRecentlyOpened;
      const updatedEntriesCount = updatedRecentEntries.workspaces.length;

      if (initialEntriesCount - toDeleteCount === updatedEntriesCount) {
        window.showInformationMessage(
          `Successfully deleted ${toDeleteCount} stale item(s) from the recently opened list.`
        );
      } else {
        window.showErrorMessage(
          `Something went wrong. Out of the ${toDeleteCount} item(s) that should have been deleted, only ${
            initialEntriesCount - updatedEntriesCount
          } got removed.`
        );
      }
    }
  );
  context.subscriptions.push(disposable);
  const config = workspace.getConfiguration('recently-opened-cleaner');
  let shouldExecuteOnStart = config.get('runOnStartupFinished') as
    | string
    | undefined;
  if (shouldExecuteOnStart) {
    commands.executeCommand(
      'recently-opened-cleaner.automatically-clean-recently-opened'
    );
  } else {
    console.log('Recenty Opened Cleaner not enabled on start-up finished');
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}

function isRecentlyOpenedValid(uri: URI) {
  return uri.scheme === 'vscode-vfs' || fs.existsSync(uri.fsPath);
}
