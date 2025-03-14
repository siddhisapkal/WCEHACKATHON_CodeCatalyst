import { db } from './firebase-config';
import { 
    doc, 
    getDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from "firebase/firestore";

export const profileService = {
    // Get user profile
    async getUserProfile(userId) {
        try {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            throw error;
        }
    },

    // Update user profile
    async updateProfile(userId, updateData) {
        try {
            const userRef = doc(db, "users", userId);
            
            // Convert new profile picture to Base64 if provided
            if (updateData.profilePicture) {
                const base64Image = await this.imageToBase64(updateData.profilePicture);
                updateData.basic_info.profilePicture = base64Image;
            }

            await updateDoc(userRef, updateData);
        } catch (error) {
            throw error;
        }
    },

    // Helper function to convert image to Base64
    async imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    // Get potential matches
    async getPotentialMatches(userId, preferences) {
        try {
            const usersRef = collection(db, "users");
            
            let q = query(usersRef);
            
            if (preferences.profileType) {
                q = query(q, where("basic_info.profileType", "array-contains-any", preferences.profileType));
            }

            const querySnapshot = await getDocs(q);
            const potentialMatches = [];
            
            querySnapshot.forEach((doc) => {
                if (doc.id !== userId) {
                    potentialMatches.push({
                        id: doc.id,
                        ...doc.data()
                    });
                }
            });

            return potentialMatches;
        } catch (error) {
            throw error;
        }
    }
}; 