<br>

<p align="center">
  <a href="https://www.nestermind.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://cdn.prod.website-files.com/677e5cfd5cfd326a9fccb87a/677fe3761fd275436fe154ba_nestermind_white.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://cdn.prod.website-files.com/677e5cfd5cfd326a9fccb87a/677e7d674bc8af6a9fb87c3a_logo.svg">
      <img alt="Nestermind logo" />
    </picture>
  </a>
</p>

<h2 align="center" >The AI real estate software for innovative agents.</h3>

<p align="center"><a href="https://nestermind.com">🌐 Website</a> · <a href="https://www.linkedin.com/company/nestermind/"><img src="./packages/twenty-website/public/images/readme/linkedin-icon.png"  width="12" height="12"/> Linkedin</a><p>

<br>

# Installation

Clone the repository

```bash
git clone https://github.com/alphalabs24/crm.git
```

Install dependencies

```bash
yarn install
```

# Run Project

Make sure you have the necessary environment variables before running the project.

### Run everything locally

```bash
npx nx start
```

### Run only frontend

```bash
npx nx start twenty-front
```

<br>

# Localization

We use [Lingui](https://lingui.dev/) for translations. And [Crowdin](https://twenty.crowdin.com/twenty) for managing them.

Run the following commands to manage translations. Make sure you have the necessary environment variables from Crowdin.

```bash
yarn i18n:crowdin-pull # Pull from Crowdin
yarn i18n:extract # Extract strings
yarn i18n:compile # Compile translations
yarn i18n:crowdin-push # Push to Crowdin
```

You can also run the following command to do everything at once.

```bash
yarn translate
```

### Adding new translations

Use lingui to add new translations. For the frontned you can use the hook `useLingui`. For the backend you can use `msg` function from lingui. When you run `yarn i18n: extract` it will extract the strings and add them to the `po` files.
After compiling them, you can then push them to Crowdin, translate them there and then pull the translations back to the project.

# Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Nx](https://nx.dev/)
- [NestJS](https://nestjs.com/), with [BullMQ](https://bullmq.io/), [PostgreSQL](https://www.postgresql.org/), [Redis](https://redis.io/)
- [React](https://reactjs.org/), with [Recoil](https://recoiljs.org/) and [Emotion](https://emotion.sh/)
- [Greptile](https://greptile.com) for code reviews.
- [Lingui](https://lingui.dev/) and [Crowdin](https://twenty.crowdin.com/twenty) for translations.
