import { db } from './firebase-config';
import { 
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot
} from "firebase/firestore";

export const chatService = {
    // Create a new chat
    async createChat(user1Id, user2Id) {
        try {
            const chatData = {
                participants: [user1Id, user2Id],
                createdAt: new Date().toISOString(),
                lastMessage: null
            };

            const chatRef = await addDoc(collection(db, "chats"), chatData);
            return chatRef.id;
        } catch (error) {
            throw error;
        }
    },

    // Send a message
    async sendMessage(chatId, senderId, message) {
        try {
            const messageData = {
                sender: senderId,
                text: message,
                timestamp: new Date().toISOString(),
                read: false
            };

            await addDoc(collection(db, "chats", chatId, "messages"), messageData);

            // Update chat's last message
            await updateDoc(doc(db, "chats", chatId), {
                lastMessage: messageData
            });
        } catch (error) {
            throw error;
        }
    },

    // Get chat messages
    async getChatMessages(chatId) {
        try {
            const messagesRef = collection(db, "chats", chatId, "messages");
            const q = query(messagesRef, orderBy("timestamp", "asc"));
            const querySnapshot = await getDocs(q);
            
            const messages = [];
            querySnapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return messages;
        } catch (error) {
            throw error;
        }
    },

    // Subscribe to chat messages (real-time updates)
    subscribeToChat(chatId, callback) {
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        
        return onSnapshot(q, (snapshot) => {
            const messages = [];
            snapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(messages);
        });
    },

    // Get user's chats
    async getUserChats(userId) {
        try {
            const chatsRef = collection(db, "chats");
            const q = query(chatsRef, where("participants", "array-contains", userId));
            const querySnapshot = await getDocs(q);
            
            const chats = [];
            querySnapshot.forEach((doc) => {
                chats.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return chats;
        } catch (error) {
            throw error;
        }
    }
}; 