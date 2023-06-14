# "Recently Opened" Cleaner

This extension allows you to clean up the "Recently Opened" list in VS Code.

## Intro

The "File: Open Recent" command is a handy feature provided by VS Code. It allows to open recently used workspaces and files through a dropdown menu right in the editor.

Unfortunately, it is not quite flawless. See, every workspace listed in the dropdown is associated with a particular path on local disk. That's fine as long as workspaces are not moved or deleted. But this happens a lot in practice. Maybe some of the workspaces opened were only temporary to begin with. Or maybe they were created in the wrong location. Either way, over time, the list of recently opened workspaces will just grow and be filled with useless entries.

To remediate this issue, this extension provides a simple command that cleans the list. To be more precise, the command goes through each workspace in the list and checks if the workspace's path is still valid. If that's not the case that entry will be removed form the list.

## Features

### Clean Recently Opened List

Currently, the extension comes with one command: `Clean Recently Opened List`. This command allows you to remove all the entries from the list that do not point to a valid path in one go.

Additionally, the the extension can run this command automatically once vs code is done starting up. The command will run without user interaction, except to report success or failure. This behaviour is turned off by default and can be activated in the settings.

## Bugs & Wishes

### Feature Requests

I'm planning on improving the UX of the existing command (e.g., give feedback on the process or report errors). I might also add a couple of options like automatically triggering the command on application start, if desired. If there’s something that would particularly help you, drop and issue on Github!

### Issues

I plan on making this a bug-free place. But hey, they're tricky to get rid of. If you find any, drop and issue on Github! :)

## Acknowledgements

- Extension icon: [Dust icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/dust)

---

## Development

### Run the extension in VS Code

Launch debug environment (default `F5`) to open a new window with the extension loaded. The opened window can be relaoded to include the latest updates to the code.

### Run tests

- Open the debug viewlet (`Ctrl+Shift+D` or `Cmd+Shift+D` on Mac) and from the launch configuration dropdown pick `Extension Tests`.
- Press `F5` to run the tests in a new window with your extension loaded.
- See the output of the test result in the debug console.
- Make changes to `src/test/suite/extension.test.ts` or create new test files inside the `test/suite` folder.
  - The provided test runner will only consider files matching the name pattern `**.test.ts`.
  - You can create folders inside the `test` folder to structure your tests any way you want.
