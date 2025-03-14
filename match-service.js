import { db } from './firebase-config';
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    arrayUnion 
} from "firebase/firestore";

export const matchService = {
    // Handle swipe action
    async handleSwipe(currentUserId, swipedUserId, direction) {
        try {
            const swipeData = {
                userId: swipedUserId,
                direction,
                timestamp: new Date().toISOString()
            };

            // Record the swipe
            await setDoc(
                doc(db, "users", currentUserId, "swipes", swipedUserId),
                swipeData
            );

            // Check for match if it's a right swipe
            if (direction === 'right') {
                const theirSwipe = await getDoc(
                    doc(db, "users", swipedUserId, "swipes", currentUserId)
                );

                if (theirSwipe.exists() && theirSwipe.data().direction === 'right') {
                    // Create match
                    await this.createMatch(currentUserId, swipedUserId);
                    return true; // Match created
                }
            }

            return false; // No match
        } catch (error) {
            throw error;
        }
    },

    // Create a match between two users
    async createMatch(user1Id, user2Id) {
        try {
            const matchId = `${user1Id}_${user2Id}`;
            const matchData = {
                users: [user1Id, user2Id],
                createdAt: new Date().toISOString(),
                status: 'active'
            };

            // Create match document
            await setDoc(doc(db, "matches", matchId), matchData);

            // Update both users' match lists
            await updateDoc(doc(db, "users", user1Id), {
                matches: arrayUnion(user2Id)
            });

            await updateDoc(doc(db, "users", user2Id), {
                matches: arrayUnion(user1Id)
            });

            return matchId;
        } catch (error) {
            throw error;
        }
    },

    // Get user's matches
    async getUserMatches(userId) {
        try {
            const userDoc = await getDoc(doc(db, "users", userId));
            const matches = userDoc.data().matches || [];
            
            const matchDetails = await Promise.all(
                matches.map(async (matchedUserId) => {
                    const matchedUserDoc = await getDoc(doc(db, "users", matchedUserId));
                    return {
                        id: matchedUserId,
                        ...matchedUserDoc.data()
                    };
                })
            );

            return matchDetails;
        } catch (error) {
            throw error;
        }
    }
}; 