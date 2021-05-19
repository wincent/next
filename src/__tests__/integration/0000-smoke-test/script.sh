# "Demo" script just to show the kinds of things we expect to be able to do.

# This is a comment.

# Note that blank lines are ignored.

# We can run `next` commands.
next add Buy milk

# We can fake the passage of time.
tick +1h

# Note the date stamp on this task is one hour later.
next add Buy eggs

# We can run arbitrary commands.
touch 'Proof that it'\''s easy to run '"arbitrary commands"

# We can do things like shell redirects.
echo something > scratch.txt
