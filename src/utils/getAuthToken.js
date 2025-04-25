import { auth } from '../firebase/firebase';

export const getAuthToken = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('No user is currently signed in');
            return null;
        }
        
        const token = await user.getIdToken();
        console.log('ID Token:', token);
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}; 