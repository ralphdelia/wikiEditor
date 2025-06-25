# wikiEditor

A wiki editing tool powered by OpenAI agents and Bun.

## Features

- Interactive CLI for authoring and editing wikis
- Agent-driven automation for file operations (read, write, list, glob, mv, patch, rm, search, mkdir)
- HTTP server for receiving and processing messages

## Prerequisites

- Bun v1.2.1 or higher
- An OpenAI API key

## Installation

```bash
bun install
```

## Configuration

Set your OpenAI API key:

```bash
export OPENAI_API_KEY="your_api_key_here"
```

## Usage

1. Start the server:

```bash
bun run src/server.ts
```

2. In another terminal, launch the CLI:

```bash
bun run src/index.ts
```
```
Enter multi-line prompts; submit by pressing Enter on an empty line.
```
