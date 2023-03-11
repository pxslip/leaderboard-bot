# Leaderboard Bot aka Bingo Bot

A discord interaction bot for managing leaderboards in discord channels

## Concepts

- Submissions - a submission is created by a racer and has a link, metadata, and a submission timestamp. A submission **Will not** appear on the leaderboard until confirmed
- Entries - an entry takes a submission, and converts it to an entry on the leaderboard. the `/get` command will return the leaderboard for the current channel. It shows the top 10 entries by default

## Usage

### Installation

_Add an install link here_

### Creating a leaderboard

In the channel you want users to use the `/submit` command execute the `/create Leaderboard Name` command. This will create a new leaderboard.

_NOTE: Creating a new leaderboard will, currently, make the old leaderboard unavailable for submissions or for retrieval_

### Submitting

The bot installs a `/submit` command for racers to use. This command accepts a url parameter and can have additional metadata added if needed

### Reviewing

The bot installs a `/review` command that optionally accepts a channel as an option. This command generates a message with the link, any metadata and 3 buttons:

1. Confirm submission\* - this moves the submission from the submissions list to the entries list. The bot will ask for an official time from the reviewer, this time is used for sorting the leaderboard
2. Reject submission - this will move the submission to the end of the queue. This command is useful if the reviewer cannot confirm the time, but the run _may_ be valid. Using this command gives an opportunity to request additional information from the runner without stopping reviews of other submissions
3. Delete submission\* - This will permanently remove the submission from the queue. This command is useful if a submission is judged to be completely invalid.

\* Still need some work

### Commands to write

- `/mine` - a command to pull a list of a user's submissions with options to delete them.
- `/delete` - a command to delete one of my submissions (how to id?)
- `/clear or /clear submissions` - clear all submissions
- `/clear entries` - clear all entries
