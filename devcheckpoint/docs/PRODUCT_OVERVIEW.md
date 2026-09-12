# Product Overview

## Product

**DevCheckpoint**

## Positioning

A local-first memory layer for developer work.

## Problem

Developers frequently switch between features, bugs, meetings, repositories, and urgent issues. Git records code history, but unfinished work often contains important context that is not captured cleanly in commits:

- current objective
- current blocker
- experiments already tried
- debugging observations
- relevant files
- next intended action

Returning to a task requires reconstructing that context.

## Solution

DevCheckpoint lets the developer create a structured checkpoint of an active task. The application combines task information with relevant Git context, sanitizes sensitive information, and uses a local AI model to generate a compact summary that can be resumed later.

## Core Value

> Git saves your code. DevCheckpoint saves the context around your code.

## Target Users

- Individual software developers
- Freelance developers managing multiple projects
- Engineering teams with frequent context switching
- Developers handing unfinished tasks to teammates
- Developers using AI coding tools who need durable task context

## MVP

- local Git repository selection
- task creation
- Git context collection
- developer notes
- checkpoint creation
- local AI summarization
- SQLite persistence
- resume task
- handoff summary

## Non-Goals for MVP

- full IDE replacement
- autonomous coding agent
- cloud source-code storage
- multi-user SaaS backend
- vector database / repo-wide RAG
- automatic Git mutation
