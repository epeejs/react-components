## DEMO

用于开发 browser 端多包项目模版

## Feature

- Typescript 开箱即用
- 支持 commonjs 和 esm 两种模块输出 or 仅用 tsc 处理输出
- CI 自动发包
- 拼写检查
- 代码格式化
- eslint 检查
- jest 测试
- commit 检查
- changelog 生成
- lerna 自动管理包依赖

## Usage

- 全局安装 lerna `yarn global add lerna`
- 修改根目录及子包目录`package.json` 中 `name`、`main`、`module`、`repository`、`author` 的值，其中 `main`、`module` 可不改；
- 删除原 README.md 内容，书写自己的 README.md；
- `lerna bootstrap` 安装所有依赖及本地包依赖
- `yarn dev` 开发模式
- `yarn build` 打包构建
- post-commit 钩子内触发`yarn version-all` 生成需要发包的版本并打上 tag，代码提交到远程
- .gitlab-ci 内触发`yarn publish-all`命令发布 npm 包

### 说明

目录结构

```bash
|- dist // build生成目录
    |- xxx.cjs.js
    |- xxx.esm.js
    |- xxx.d.ts
|- src
    |- index.ts
    |- __tests__ # 测试目录
        |- index.test.ts
|- .babelrc
|- .editorconfig
|- .eslintignore
|- .eslintrc
|- .gitignore
|- .gitlab-ci.yml
|- commitlint.config.js // commit信息检查
|- package.json
|- README.md
|- rollup.config.js
|- tsconfig.json
```

根目录 package.json

```
"scripts": {
  "test": "lerna run test",
  "build": "lerna run build",
  "dev": "lerna run dev",
  "lint:all": "lerna run lint:all",
  "test:watch": "lerna run test:watch",
  "test:coverage": "lerna run test:coverage",
  "ci": "lerna run ci",
  "spell-check:all": "lerna run spell-check:all",
  "prettier": "lerna run prettier",
  "version-first-beta": "lerna version prepatch --preid beta --yes",
  "version-beta": "lerna version --preid beta --no-commit-hooks --yes",
  "version-patch": "lerna version patch --yes",
  "version-release": "lerna version --yes",
  "publish-all": "lerna publish from-git --yes"
}
```

子目录 package.json

```
"scripts": {
  "build": "rollup -c ./rollup.config.js",
  "dev": "rollup -w -c rollup.config.js",
  "clean": "rimraf -rf ./dist",
  "test": "umi-test",
  "test:watch": "umi-test --watch",
  "test:coverage": "umi-test --coverage",
  "ci": "yarn tsc --noEmit && yarn lint:all && yarn spell-check:all && yarn test:coverage",
  "lint:all": "yarn eslint --ext .js,.jsx,.ts,.tsx --format=pretty ./src",
  "spell-check:all": "cspell \"src/**/*.{txt,ts,tsx,js,json,md}\"",
  "prettier": "prettier --write \"src/**/**.{js,jsx,tsx,ts,less,md,json}\""
},
```

## lerna

### lerna 是什么

> A tool for managing JavaScript projects with multiple packages. Lerna is a tool that optimizes the workflow around managing multi-package repositories with git and npm.

Lerna 是一个管理多个 npm 模块的工具，是 Babel 自己用来维护自己的 Monorepo 并开源出的一个项目。优化维护多包的工作流，解决多个包互相依赖，且发布需要手动维护多个包的问题。

一个基本的 Lerna 管理的仓库结构如下

```
my-lerna-repo/
  package.json
  lerna.json
  packages/
    package-1/
      package.json
    package-2/
      package.json
```

### 安装

```
yarn global add lerna
```

### 初始化项目

```
mkdir lerna-demo
cd lerna-demo

lerna init # 固定模式(Fixed mode)默认为固定模式，packages下的所有包共用一个版本号(version)
lerna init --independent # 独立模式(Independent mode)，每一个包有一个独立的版本号
```

##### independent 与 fixed 区别

Fixed/Locked mode，在这种模式下，实际上 lerna 是把工程当作一个整体来对待。每次发布 packges，都是全量发布，无论是否修改。在 Independent mode 下，lerna 会配合 Git，检查文件变动，只发布有改动的 packge 及依赖了该 package 的包。

### 创建包

方法 1-手动创建:

```
mkdir package-a
cd package-a
npm init -y
```

方法 2-使用 lerna create 方法创建:

```
lerna create <name> [loc]

lerna create cli-ui

lerna create @myfast/core --access public
```

> create 命令详情 请参考 [lerna create](https://github.com/lerna/lerna/blob/main/commands/create/README.md)

### lerna 常用命令

lerna 提供了很多的命令，我们可以通过`lerna --help`查看，但根据 2/8 法则我们更应该关注下面这几个命令

- `lerna bootstrap` 等同于`lerna link + yarn install`，用于创建软链包与安装依赖包
- `lerna run`：会像执行一个 for 循环一样，在所有子项目中执行 `npm script` 脚本，并且，它会非常智能的识别依赖关系，并从根依赖开始执行命令；
- `lerna add <package>[@version] [--dev]` 向 packages 内的包安装本地或者线上包，该命令让 Lerna 可以识别并追踪包之间的依赖关系，因此非常重要
- `lerna exec -- <command> [..args]` 像 `lerna run` 一样，会按照依赖顺序执行命令，不同的是，它可以执行任何命令，例如 `shell` 脚本；
- `lerna version` 根据有变动的包，生成新的包版本，并更新其它包的依赖关系，最终打上 tag 并提交到远程 git 仓库，是`lerna publish`命令中的默认前置命令
- `lerna publish` 发布代码有变动的 `package`，因此首先您需要在使用 `Lerna` 前使用 `git commit` 命令提交代码，好让 `Lerna` 有一个 `baseline`；

#### 项目添加依赖

1、手动在 package-a 的`dependencies` or `devDependencies`内添加依赖

2、命令行添加

```
lerna add <package>[@version] [--dev] # 命令签名

# 例如
lerna add package-a --scope=package-b # 将 package-a 安装到 package-b
lerna add package-a --scope=package-b --dev # 将 package-a 安装到 package-b 的 devDependencies 下
lerna add package-a --scope=package-b --peer # 将 package-a 安装到 package-b 的 peerDependencies 下
lerna add package-a # 将 package-a 安装到除 package-a 以外的所有模块
lerna add @babel/core # 将 @babel/core 安装到所有模块
```

#### 项目卸载依赖

```
lerna exec -- <command> [..args] # 在每个 package 中执行任意命令，用波折号(--)分割命令语句

lerna exec --scope=npm-list  yarn remove listr # 将 npm-list 包下的 listr 卸载
lerna exec -- yarn remove listr # 将所有包下的 listr 卸载
```

#### 安装依赖

执行 lerna bootstrap 用于创建软链包与安装依赖包

```
lerna bootstrap
```

执行该命令式做了以下四件事：

1. 为每个 `package` 安装依赖
2. 链接相互依赖的库到具体的目录，例如：如果 package1 依赖 package2，且版本刚好为本地版本，那么会在 node_modules 中链接本地项目，如果版本不满足，需按正常依赖安装
3. 在 bootstraped packages 中 执行 `npm run prepublish`
4. 在 bootstraped packages 中 执行 `npm run prepare`

#### 显示 packages 下的各个 package 的 version 及依赖关系

```
lerna ls
lerna ls --json
```

```
lerna ls --graph // 查看内部依赖
```

```
lerna ls --graph --all // 查看所有依赖
```

#### 清理 packages 中每个 package 的 node_modules

```
lerna clean
```

#### 执行 packages 中每个 pacakge 内的 scripts

```
lerna run <script> -- [..args] # 在所有包下运行指定

# 例如
lerna run test # 运行所有包的 test 命令
lerna run build # 运行所有包的 build 命令
lerna run --parallel watch # 观看所有包并在更改时发报，流式处理前缀输出

lerna run --scope package-a test # 运行 package-a 模块下的 test
```

#### 获取本地发包的涉及到的包的新版本号及 changeLog

lerna version 生成新的唯一版本号

```
lerna version 1.0.1 # 显示指定

lerna version patch # 语义关键字

lerna version # 从提示中选择

lerna version [major | minor | patch | premajor | preminor | prepatch | prerelease]

lerna version -m "chore(release): publish"

lerna version --conventional-prerelease 生成alpha版本

lerna version --conventional-prerelease --preid beta 生成beta版本
```

##### 自动计算包的新版本号的规则,即 conventionalCommits:true 的场景

<h6>fixed模式</h6>

1. 根据 commit 信息计算，当前包的版本是 major | minor | patch | premajor | preminor | prepatch | prerelease 等，注意这里每个包的 comit 信息会包含指定 scope 的 commit 及没有指定 scope 的 commit msg;这个自动判断是在 conventional-changelog-xxx 预设内

2. 计算完成之后，会在做一层统一更新，先从包的版本内，获取最高的版本号，然后将其它包的版本号都更改成最高的这个版本号

```
setGlobalVersionCeiling(versions) {
  let highestVersion = this.project.version;

  versions.forEach((bump) => {
    if (bump && semver.gt(bump, highestVersion)) {
      highestVersion = bump;
    }
  });

  versions.forEach((_, name) => versions.set(name, highestVersion));

  return highestVersion;
}
```

<h6>independent模式下</h6>

1. 第一步跟 fixed 模式下的第一步是一样的，只是没有第二部在统一修改版本号的操作

<h6>所以自动推算版本号可以做如下总结</h6>

1. independent 模式下，通过 git 来判断改动了哪些文件，从而判断哪些包做了变动，变了的包会将本次 commit msg 添加到 commits 数组内，用于版本推导，推导版本的规则是 type=feat|feture => minor ， commit msg footer 内 BREAK CHANGE，或者 scope 后面有!,比如 fix(cli-utils)!: xxxx; => major（0.x.x 开始的版本会被做一次修正 major => minor）; 其它都是 patch 版本

2. fixed 模式下，上一步推导出每个包的版本号之后，在做一次版本号修正，获取每个包推导的版本号，用最大的版本号，去覆盖其它包的版本号

3. 我们推送 commit msg 的时候，一定要注意改动了哪些包内的文件，然后正确的使用 feat|!等推导 minor ｜ major 的关键 type 或者标识

4. 如果使用了 bump 关键字，不论 independent 模式还是 fixed 模式，都是按照 bump 关键字生成版本号

0.x.x 升级主版本的时候，不会成功，会变成小版本，只有包的主版本本身大于 1 的时候才会直接升主版本

```
if (semver.major(pkg.version) === 0) {
  if (releaseType === "major") {
    releaseType = "minor";
  }
}
```

##### 非自动计算包的新版本号的规则,即 conventionalCommits:false 的场景

版本号都是通过交互工具，让用户确定包的新版本号，具体如下图所示

lerna version 内部流程可以参考总结的脑图

> 更多 lerna version 命令可以[lerna version](https://github.com/lerna/lerna/blob/main/commands/version/README.md)

#### 发布 npm 包

```
lerna publish

// 强制重新发布
lerna publish --force-publish

// 显示的发布在当前commit中打了符合规则的tag的packages
lerna publish from-git

// 显示的发布当前版本在注册表中（registry）不存在的packages（之前没有发布到npm上）
lerna publish from-package
```

> 更多 lerna publish 命令可以[lerna publish](https://github.com/lerna/lerna/blob/main/commands/publish/README.md)

## lerna.json 字段解析

lerna.json 解析

```
{
  "version": "independent",
  "npmClient": "yarn",
  "useWorkspaces": true,
  "command": {
    "version": {
      "conventionalCommits": true,
      "changelogPreset": {
        "name": "conventional-changelog-conventionalcommits",
        "types": [
          {
            "type": "feat",
            "section": ":rocket: New Features",
            "hidden": false
          },
          {
            "type": "fix",
            "section": ":bug: Bug Fix",
            "hidden": false
          },
          {
            "type": "docs",
            "section": ":memo: Documentation",
            "hidden": false
          },
          {
            "type": "style",
            "section": ":sparkles: Styling",
            "hidden": false
          },
          {
            "type": "refactor",
            "section": ":house: Code Refactoring",
            "hidden": false
          },
          {
            "type": "build",
            "section": ":hammer: Build System",
            "hidden": false
          },
          {
            "type": "chore",
            "section": ":mega: Other",
            "hidden": false
          }
        ]
      },
      "gitTagVersion": true,
      "push": false
    },
    "publish": {
      "conventionalCommits": true,
      "ignoreChanges": ["ignored-file", "*.md"],
      "registry": "https://registry.npmjs.org",
      "message": "chore: publish"
    }
  }
}
```

version：当前库的版本,如果是具体数字则是 fixed 模式，如果是 independent 则是 independent 模式 npmClient： 允许指定命令使用的 client， 默认是 npm， 可以设置成 yarn command.publish 控制发布的参数，所有命令行的参数都可以在这里定义，避免在命令行上输入参数，其它的命令参数都可以同样的方式书写 command.publish.ignoreChanges：可以指定那些目录或者文件的变更不会被 publish command.bootstrap.ignore：指定不受 bootstrap 命令影响的包 command.bootstrap.npmClientArgs：指定默认传给 lerna bootstrap 命令的参数 command.bootstrap.scope：指定那些包会受 lerna bootstrap 命令影响 packages：指定包所在的目录 command.version.changelogPreset：修改生成 changelog 文件的预设

## 生成 changeLog

```
{
  "version": "independent",
  "npmClient": "yarn",
  "useWorkspaces": true,
  "command": {
    "version": {
      "conventionalCommits": true,
    },
    "publish": {
      "conventionalCommits": true,
      "ignoreChanges": ["ignored-file", "*.md"],
      "registry": "https://registry.npmjs.org",
      "message": "chore: publish %s"
    }
  }
}
```

通过命令行参数--conventional-commits or 在 lerna.json 中配置"conventionalCommits": true,如上所示，则会在每个 package 中生成一份 changlog；需要注意的是 fixed 模式下，会在根目录也生成一份 changeLog，而 independent 模式则不会在根目录下生成一份 changeLog

然后为了保成生成 changelog 内容的格式，我们需要规范我们的 commit-msg

规范 comit-msg 的方式有很多中，我们选择@commitlint/cli + husky 的方式，在提交的时候做校验，然后这里有不同的规范，

- @commitlint/config-conventional // 提供交互与 icon
- @commitlint/config-lerna-scopes // 提供 lerna 管理的 memorepo 的 scope 校验
- @commitlint/config-angular // angular 的共享规则

这里我们选择

```
module.exports = {
  // 继承默认配置
  extends: [
    '@commitlint/config-conventional',
    '@commitlint/config-lerna-scopes'
  ]
};
```

注意点：

1. 当我们执行 version or publish 命令的时候，如果 conventionalCommits: true 或者命令行添加了该参数，则会直接跳过选择包升级版本的步骤，直接到确认版本是否是需要的版本步骤，如果命令行在加上--yes，会跳过所有命令行确认步骤

2. publish 中的 message 字段是，lerna 在在计算版本的时候，会修改 package.json 且会进行一次 commit，所以这里需要我们添加 message，且要符合 commit-msg 校验的，之前本来是想使用包名称的"chore(包名称): publish"，但是包名称这里不能使用变量，或者变量不生效，这里到时可以看下源码

### lerna 最佳实践

如果项目内的包有明显的依赖关系，且包的版本变动比较平凡推荐使用 fixed 模式如果项目内的包没有依赖关系，且包的版本变动不频繁，则推荐使用 independent 模式

```
lerna.json
{
  "version": "0.0.0", // 独立模式改成independent即可，其它不变
  "npmClient": "yarn",
  "useWorkspaces": true,
  "command": {
    "version": {
      "conventionalCommits": true,
      "changelogPreset": {
        "name": "conventional-changelog-conventionalcommits"
      },
      "push": false // 这里设置为false的作用是，lerna version之后只生成一个commit与tag，不进行代码的推送，目的是我们可以确认tag内的version是不是我们本地发版想要的version号，如果不是可以通过git reset --soft HEAD^，回退之后，在修改下lerna version的参数来生成想要的版本号
    },
    "publish": {
      "ignoreChanges": [
        "ignored-file",
        "*.md"
      ],
      "registry": "https://registry-npm.myscrm.cn/repository/yunke/",
      "message": "chore: publish"
    }
  }
}
```

```
{
  "scripts": {
    "version-first-beta": "lerna version prepatch --preid beta --yes", // 第一次发布beta版本
    "version-beta": "lerna version --preid beta --no-commit-hooks --yes", // 第n次发布beta的补丁版本
    "version-patch": "lerna version patch --yes", // 发布正式的补丁版本
    "version-release": "lerna version --yes", // 根据commit-msg推断版本
    "publish-all": "lerna publish from-git --yes" // 根据当前的tag，以tag内版本号来发布npm版本
  },
  "husky": {
    "hooks": {
      "pre-commit": "yarn test && lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      "post-commit": "HUSKY_SKIP_HOOKS=1 yarn version-patch" // post-commit钩子执行生成版本的命令，用于ci/cd自动发对应版本的包，这里需要根据实际情况调整；HUSKY_SKIP_HOOKS=1语句一定不能去掉，不然会造成死循环
    }
  },
}
```

```
.gitlab-cli.yml
stages:
  - publish

publish:
  stage: publish
  image: node:12.21.0
  script:
    - echo -e $NPM_AUTH_CONTENT >> ~/.npmrc
    - yarn config set @yunke:registry https://registry-npm.myscrm.cn/repository/yunke/
    - yarn --check-files
    - yarn build
    - yarn publish-all // 构建之后发布npm包

  rules:
    - if: '$CI_COMMIT_BRANCH == "master"'
      changes:
        - package.json
        - lerna.json
      when: always

```

#### 具体的开发流程例子

- 修改 packages/xxx 文件
- git add .
- git commit -m 'fix(xxx): 修复数据读取错误 bug'
- git log 查看生成的版本号是否是对的
- 如果不对 git reset --soft HEAD^
- 修改 package.json 内 version-beta 相关命令的参数
- 在重新 git add. && git commit -m 'fix(xxx): 修复数据读取错误 bug'
- 如果版本号是对的，则提交代码 git push --follow-tags 一定要加--follow-tags 参数

注意因为是公司内部的项目，所以基本是每一次 commit 都是想发一个新的 npm 包版本的，所以在 post-commit 钩子那里去加了 lerna version 的命令；如果不想每次 commit 发布 npm 包可以把 post-commit 这个钩子去掉；自己想哪次 commit 之后发版，只要 commit 之后执行 lerna version 命令即可，代码提交方式保持不变

#### 发布可能碰到的问题

1、版本号生成不是想要的 version

这时候我们先把--yes 参数去掉，然后需要自己去尝试 lerna version 后面跟的不同的参数

2、本地生成了 tag，但是代码 push 之后，npm 包没有发布对应的版本

先排查 gitlab-cli 内的 jobs 构建是否成功如果不成功找报错如果成功则看下是 gitlab 远程仓库下是否有对应的 tag 如果没有则是 push 代码的时候漏加--follow-tags 参数了重新产生一次 commit 即可
