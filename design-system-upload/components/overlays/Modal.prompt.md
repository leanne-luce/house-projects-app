`Modal` holds every add/edit flow — new house, new detail, move, quick capture.

```jsx
<Modal title="Add a detail" onClose={close}><Field label="Name"><TextInput /></Field></Modal>
```

Below 640px the real app docks it to the bottom edge with only the top corners rounded.
