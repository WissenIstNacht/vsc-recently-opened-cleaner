import * as fs from 'fs';
import * as vscode from 'vscode';

type URI = vscode.Uri;

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

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'recently-opened-cleaner.clean-recently-opened',
    async () => {
      let recentEntries = (await vscode.commands.executeCommand(
        '_workbench.getRecentlyOpened'
      )) as IRecentlyOpened;

      const filtered = recentEntries.workspaces.filter(
        (ws) => !isRecentlyOpenedValid(ws.folderUri)
      );
      const initialEntriesCount = recentEntries.workspaces.length;
      const toDeleteCount = filtered.length;

      filtered.forEach((ws) => {
        console.log('Deleting ' + ws.folderUri.toString());
        try {
          vscode.commands.executeCommand(
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

      recentEntries = (await vscode.commands.executeCommand(
        '_workbench.getRecentlyOpened'
      )) as IRecentlyOpened;
      const newEntriesCount = recentEntries.workspaces.length;

      if (initialEntriesCount - toDeleteCount === newEntriesCount) {
        console.log('success');
      } else {
        console.error(
          'From the initial ' +
            initialEntriesCount +
            ' entries, ' +
            toDeleteCount +
            ' entries should have been deleted. Effectively deleted: ' +
            newEntriesCount
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function isRecentlyOpenedValid(uri: URI) {
  return uri.scheme === 'vscode-vfs' || fs.existsSync(uri.fsPath);
}
