setup:
  npm install
  just -l

dev:
  npm run dev

test:
  npm run checks
  npm run build

bump +type:
  npm version "{{ type }}" --message "v%s" --force
