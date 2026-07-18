# Contributing

Contributions are **welcome** and will be fully **credited**.

Please read and understand the contribution guide before creating an issue or pull request.

## Etiquette

This project is open source, and as such, the maintainers give their free time to build and maintain the source code held within. They make the code freely available in the hope that it will be of use to other developers. It would be extremely unfair for them to suffer abuse or anger for their hard work.

Please be considerate towards maintainers when raising issues or presenting pull requests. Let's show the world that developers are civilized and selfless people.

It's the duty of the maintainer to ensure that all submissions to the project are of sufficient quality to benefit the project. Many developers have different  skillsets, strengths, and weaknesses. Respect the maintainer's decision, and do not be upset or abusive if your submission is not used.

## Viability

When requesting or submitting new features, first consider whether it might be useful to others. Open source projects are used by many developers, who may have entirely different needs to your own. Think about whether or not your feature is likely to be used by other users of the project.

## Procedure

Before filing an issue:

- Attempt to replicate the problem, to ensure that it wasn't a coincidental incident.
- Check to make sure your feature suggestion isn't already present within the project.
- Check the pull requests tab to ensure that the bug doesn't have a fix in progress.
- Check the pull requests tab to ensure that the feature isn't already in progress.

Before submitting a pull request:

- Check the codebase to ensure that your feature doesn't already exist.
- Check the pull requests to ensure that another person hasn't already submitted the feature or fix.


## Commit messages

### Conventional Commit Structure

The **Conventional Commits** format is structured as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

- **`<type>`**: Specifies the type of change. Common types are `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- **`<scope>`**: (Optional) A short, descriptive word for what part of the code is affected (e.g., `auth`, `config`).
- **`<description>`**: A brief description of the change.
- **`Body`**: (Optional) Provides more detailed information about the commit.
- **`Footer`**: (Optional) Used to reference issues or indicate breaking changes.

### Commit Types and Their Role in Semantic Versioning

The **type** field in a Conventional Commit message is what allows you to derive the next semantic version:

- **`feat`**: A new feature. Increments the **MINOR** version (e.g., `1.2.0`).
  - Example: `feat(config): add async pipe handling support`

- **`fix`**: A bug fix. Increments the **PATCH** version (e.g., `1.2.1`).
  - Example: `fix(api): resolve issue with null values in responses`

- **`docs`**: Documentation changes. Does **not** increment the version (meta change).
  - Example: `docs(readme): update installation instructions`

- **`style`**: Changes related to code style (e.g., formatting, missing semicolons). No version increment.
  - Example: `style(config): reformat code according to ESLint rules`

- **`refactor`**: A code change that does not add a feature or fix a bug. No version increment.
  - Example: `refactor(auth): simplify token validation logic`

- **`test`**: Changes related to testing (e.g., adding missing tests, refactoring tests). No version increment.
  - Example: `test(config): add unit tests for error handling`

- **`chore`**: Maintenance tasks that do not affect the functionality of the code (e.g., updating dependencies, build-related changes). No version increment.
  - Example: `chore(deps): update lodash to version 4.17.21`

- **`BREAKING CHANGE`**: Use this in the footer if the commit introduces a breaking API change, which increments the **MAJOR** version.
  - Example:
    ```
    feat(config): change pipe API to accept configuration object

    BREAKING CHANGE: The config now requires a configuration object instead of individual parameters.
    ```

### Example Commit Messages
1. **New Feature**:
   ```
   feat(config): add support for multiple output formats
   ```
   This will trigger a **MINOR** version bump.

2. **Bug Fix**:
   ```
   fix(api): correct error handling when input is invalid
   ```
   This will trigger a **PATCH** version bump.

3. **Breaking Change**:
   ```
   feat(auth): switch to JWT for authentication

   BREAKING CHANGE: The authentication system now uses JWT tokens instead of session cookies.
   ```
   This will trigger a **MAJOR** version bump.

## Requirements

If the project maintainer has any additional requirements, you will find them listed here.

- The easiest way to apply the conventions is to install [Eslint](https://eslint.org/)
- **Add tests!** - Your patch won't be accepted if it doesn't have tests.
- **Document any change in behaviour** - Make sure the `README.md` and any other relevant documentation are kept up-to-date.
- **Consider our release cycle** - We try to follow [SemVer v2.0.0](http://semver.org/). Randomly breaking public APIs is not an option.
- **One pull request per feature** - If you want to do more than one thing, send multiple pull requests.
- **Conventional commit** - For you commit messages, use [Conventional commit message guidelines](https://www.conventionalcommits.org/en/v1.0.0/).
- **Send coherent history** - Make sure each individual  commit in your pull request is meaningful. If you had to make multiple  intermediate commits while developing, please [squash them](http://www.git-scm.com/book/en/v2/Git-Tools-Rewriting-History#Changing-Multiple-Commit-Messages) before submitting.
- **Release Strategy** - We use [Release Please Action](https://github.com/googleapis/release-please-action)

**Happy coding**!