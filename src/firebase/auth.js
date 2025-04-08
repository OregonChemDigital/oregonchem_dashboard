import { getAuth } from "firebase/auth";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, sendPasswordResetEmail, updatePassword, sendEmailVerification } from "firebase/auth";

const auth = getAuth();

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    try {
        return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
};

export const doSignInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

export const doSignOut = async () => {
    try {
        await signOut(auth);
        window.location.href = '/login';
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

export const doPasswordReset = async (email) => {
    try {
        return await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

export const doPasswordChange = async (password) => {
    try {
        return await updatePassword(auth.currentUser, password);
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

export const doSendEmailVerification = async () => {
    try {
        return await sendEmailVerification(auth.currentUser);
    } catch (error) {
        console.error('Error sending email verification:', error);
        throw error;
    }
};