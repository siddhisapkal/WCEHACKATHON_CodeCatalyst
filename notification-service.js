import { db } from './firebase-config';
import { 
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    updateDoc
} from "firebase/firestore";

export const notificationService = {
    // Create notification
    async createNotification(userId, type, data) {
        try {
            const notificationData = {
                userId,
                type, // 'match', 'message', 'project_invite', etc.
                data,
                read: false,
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, "notifications"), notificationData);
        } catch (error) {
            throw error;
        }
    },

    // Get user's notifications
    async getUserNotifications(userId) {
        try {
            const notificationsRef = collection(db, "notifications");
            const q = query(
                notificationsRef,
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            const notifications = [];
            
            querySnapshot.forEach((doc) => {
                notifications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return notifications;
        } catch (error) {
            throw error;
        }
    },

    // Mark notification as read
    async markNotificationAsRead(notificationId) {
        try {
            await updateDoc(doc(db, "notifications", notificationId), {
                read: true
            });
        } catch (error) {
            throw error;
        }
    }
}; 