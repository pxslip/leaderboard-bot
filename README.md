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

### Viewing the leaderboard

- `/ladder` and its alias `/get` both render the leaderboard ordered by submission length

### Reviewing

I recommend using a channel that only the reviewers have access to to review runs. the `/review` command accepts an optional channel input that you can use to review leaderboards in other channels. The `/proxy` command can also be used to set a default target channel for commands.

The bot installs a `/review` command that optionally accepts a channel as an option. This command generates a message with the link, any metadata and 3 buttons:

1. Confirm submission - this moves the submission from the submissions list to the entries list. The bot will ask for an official time from the reviewer, this time is used for sorting the leaderboard
2. Reject submission - this will move the submission to the end of the queue. This command is useful if the reviewer cannot confirm the time, but the run _may_ be valid. Using this command gives an opportunity to request additional information from the runner without stopping reviews of other submissions
3. Delete submission - This will permanently remove the submission from the queue. This command is useful if a submission is judged to be completely invalid.

The `/list-submissions` command will show a list of submissions that need to be reviewed.

### Command Glossary

\*_Leaderboard lookup order - channel in command, current channel, proxied channel_

- `/create` - creates a leaderboard associated with the current channel
- `/get [channel]` or `/ladder [channel]` - displays the leaderboard associated with the the provided channel, current channel, or the proxied channel
- `/list-submissions [channel]` - show a list of submissions in the queue to be reviewed
- `/proxy channel` - set a target channel for fallback
- `/review [channel]` - pop a submission off of the queue with review command buttons
- `/submit` - Show the form to submit a run

## Roadmap

- Arbitrary metadata (up to 4)
  - Part of the create command? Convert create to a modal with a field, comma separated meta keys?
