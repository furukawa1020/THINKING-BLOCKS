package websocket

import (
	"encoding/json"
	"log"
)

// Hub maintains the set of active clients and broadcasts messages to the clients.
type Hub struct {
	// Registered clients.
	clients map[string]map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan Message

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

type Message struct {
	ProjectID string          `json:"project_id"`
	Type      string          `json:"type"`
	UserID    string          `json:"user_id"`
	Data      json.RawMessage `json:"data"`
	Timestamp int64           `json:"timestamp"`
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[string]map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			projectClients := h.clients[client.projectID]
			if projectClients == nil {
				projectClients = make(map[*Client]bool)
				h.clients[client.projectID] = projectClients
			}
			projectClients[client] = true
			log.Printf("Client registered for project %s, total: %d", client.projectID, len(projectClients))

		case client := <-h.unregister:
			if projectClients, ok := h.clients[client.projectID]; ok {
				if _, ok := projectClients[client]; ok {
					delete(projectClients, client)
					close(client.send)
					log.Printf("Client unregistered from project %s, remaining: %d", client.projectID, len(projectClients))
					
					if len(projectClients) == 0 {
						delete(h.clients, client.projectID)
					}
				}
			}

		case message := <-h.broadcast:
			projectClients := h.clients[message.ProjectID]
			messageBytes, err := json.Marshal(message)
			if err != nil {
				log.Printf("Error marshaling message: %v", err)
				continue
			}

			for client := range projectClients {
				select {
				case client.send <- messageBytes:
				default:
					close(client.send)
					delete(projectClients, client)
				}
			}
		}
	}
}

func (h *Hub) BroadcastMessage(message Message) {
	h.broadcast <- message
}
