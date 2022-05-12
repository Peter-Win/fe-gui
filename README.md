# fe-gui

The **fe-gui** utility is designed to quickly create a project infrastructure using the following stack: (JavaScript or TypeScript) + React.
Unlike other similar utilities, it does not use the command line, but a graphical interface.

The closest competitor to this utility is [create-react-app](https://create-react-app.dev/).

**Fe-gui** does not create sandboxes like create-react-app does. All technologies are connected as if it were done by a person - dependencies are installed, the necessary files are added, appropriate changes are made to the configs, etc.

**Fe-gui** is not a library or dev-dependency of a project. It can be installed to create a project and set up its infrastructure. Then it can be removed. And even then reinstall. The utility does not leave any extra files in the project. It doesn't have any configs of its own. All information is taken from project files.

[GIT](https://git-scm.com/) is required for installation. For execution - [Node.js](https://nodejs.org). Thus, the utility is practically independent of the user's operating system.

The utility, of course, can be used by novice developers. However, professionals can benefit the most. They are well aware that the time spent on infrastructure development does not bring value to the business. On the other hand, a properly configured infrastructure can greatly improve development efficiency. **Fe-gui** allows you to make the necessary settings in just a few minutes.

Unfortunately, create-react-app has a number of shortcomings that forced us to create an alternative:
* It is almost impossible to control the process of creating an application. You can choose presets, but still a lot of unnecessary is generated.
* The application works in a sandbox and does not provide access to configs, which creates problems when installing a number of libraries.
* Access to configs appears after executing the *eject* command. But these configs contain a huge amount of redundant information, which makes it much more difficult to work with them.

Advantages of **fe-gui**:
* There is no need to study extensive documentation, since all actions are performed through an intuitive (I hope so) graphical interface.
* The necessary properties of the project are selected before the start of its generation.
* During generation, an application is created with the minimum required set of dependencies.
* Other technologies are installed as needed. Currently, about two dozen add-ons are available to the user.
* Addons have short names that are understandable to professionals. For example, Jest or ESLint. But if you do not understand the name, then you can click on the name of the addon. Then a window opens where you can get information and links to relevant resources. In the same place, you can select the desired settings and perform an automatic installation in a couple of minutes.
* Only the minimum necessary changes are made to the configs. Therefore, if necessary, you can manually make the necessary changes to these configs without much difficulty.

**Fe-gui** also has disadvantages:
* The system is under experimental development, so bugs are quite possible.
* There is no community.
* Too minimalistic design.
* When new versions of various packages are released, this often leads to incompatibility with other technologies used. Unfortunately, it is not always possible to track such situations promptly.


## Installation
We are already used to the fact that installation is usually done using npm. But here it is not so. Here you just need to copy the folder with the **fe-gui** code to the project folder.
There are several installation options that don't really differ much from each other.

Most typical scenario:
* user creates an empty folder for the project. For example: `md myProject`
* user opens this folder: `cd myProject`
* clones the repository: `git clone https://github.com/Peter-Win/fe-gui`
* opens fe-gui folder: `cd fe-gui`
* starts the utility: `node start`

Another possible scenario assumes the initial use of a version control system:
* The user (or admin) creates a repository on some server (for example, on a github).
* The user clones the repository on their local machine: `git clone repository-url/myProject`
* opens the project folder: `cd myProject`
* clones the fe-gui repository: `git clone https://github.com/Peter-Win/fe-gui`
* opens the fe-gui folder: `cd fe-gui`
* and starts the utility: `node start`
However, even when using the first scenario, you can connect the project to the version control system using the *Git* addon.

## Create a new project
When creating a new project, the following options are used:
* Package manager: Yarn, NPM or pnpm
* Programming language: JavaScript or TypeScript.
* Transpiler: Babel, TypeScript or SWC.
* Framework: React ver 17 or React latest (18)
* You can immediately install a style management system. But they can be installed later, and it becomes possible to specify additional options.

##  List of addons in alphabetical order
Addons are available after project creation.
Some addons become available only under certain conditions.

| Name | Conditions | Description |
|------|------------|-------------|
| Antd | Used by React | [Ant Design](https://ant.design/docs/react/introduce) |
| AntdLayout | Installed Antd | Application homepage layout generator using Ant Design |
| AssetModules |  | Setting up Webpack to include additional resources. For example, images or fonts. |
| CSS | | Ability to import styles from CSS files. |
| CssModules |  | Using modules for styles of different types: CSS, LESS, Sass. |
| ESLint |  | [Linter](https://eslint.org/), [Prettier](https://prettier.io/), and the ability to use an [Airbnb](https://www.npmjs.com/package/eslint-config-airbnb) preset. |
| Git | If not using GIT | Ability to connect the project to an external repository. |
| Husky | Used by Git | [Husky](https://typicode.github.io/husky/#/) Ability to customize the functions performed by git hooks. For example, the author usually uses a test call and a linter before a commit. |
| Jest | | [Jest](https://jestjs.io/) unit testing |
| LESS | | [Less](https://lesscss.org/) language extension for CSS |
| MobX | | [MobX](https://mobx.js.org/) state manager |
| ReactComponent | React | Component source code generation. Allows you to reduce the time to create new components. Functionality depends on installed technologies: styles, Jest, MobX, ReactTestingLibrary, Storybook. |
| ReactRouter | React | [ReactRouter](https://reactrouter.com/) The most popular navigation system for React. |
| ReactTestingLibrary | React and Jest | [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) |
| Sass | | [Sass](https://sass-lang.com/) Another popular style description language. |
| Standard | JavaScript only | [JavaScript Standard Style](https://standardjs.com/). Alternative system for ESLint. |
| Storybook | React | [Storybook](https://storybook.js.org/) A tool for building UI components |
| TypeCheck | TypeScript language but transpiler is not TypeScript | A useful feature for type checking when using Babel or SWC transpiler. |
