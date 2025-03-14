import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";
import { auth, db } from './firebase-config';
import { doc, setDoc } from "firebase/firestore";

export const authService = {
    // Convert image file to Base64
    async imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    // Register new user
    async register(email, password, userData) {
        try {
            // Create auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Convert profile picture to Base64 if provided
            let profilePictureBase64 = null;
            if (userData.profilePicture) {
                profilePictureBase64 = await this.imageToBase64(userData.profilePicture);
            }

            // Create user profile in Firestore
            await setDoc(doc(db, "users", user.uid), {
                basic_info: {
                    name: userData.name,
                    age: userData.age,
                    institution: userData.institution,
                    profileType: userData.profileType, // ["mentor", "mentee", "companion"]
                    bio: userData.bio,
                    profilePicture: profilePictureBase64 // Store as Base64
                },
                skills: userData.skills || [],
                interests: userData.interests || [],
                projects: userData.projects || [],
                matches: {},
                swipes: {},
                createdAt: new Date().toISOString()
            });

            // Update auth profile
            await updateProfile(user, {
                displayName: userData.name,
                photoURL: profilePictureBase64 // Use Base64 image
            });

            return user;
        } catch (error) {
            throw error;
        }
    },

    // Login user
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    },

    // Logout user
    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            throw error;
        }
    }
}; 