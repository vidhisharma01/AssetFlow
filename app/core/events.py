from typing import Any, Callable, Dict, List


class EventDispatcher:
    def __init__(self):
        self._listeners: Dict[str, List[Callable[[Any], None]]] = {}

    def subscribe(self, event_name: str, callback: Callable[[Any], None]) -> None:
        if event_name not in self._listeners:
            self._listeners[event_name] = []
        self._listeners[event_name].append(callback)

    def dispatch(self, event_name: str, payload: Any = None) -> None:
        for callback in self._listeners.get(event_name, []):
            try:
                callback(payload)
            except Exception as e:
                print(f"Error handling event {event_name}: {e}")


dispatcher = EventDispatcher()
