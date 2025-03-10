import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup, auth } from '../../firebase';
import { onAuthStateChanged } from "firebase/auth";
import './SignIn.css';

const SignIn = () => {
    const [signState, setSignState] = useState("Sign In");
    const [name, setName] = useState(""); 
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Track Firebase Authentication Status
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("User is logged in:", user);
                
                // ✅ Get Firebase token
                const idToken = await user.getIdToken();
                
                // ✅ Store token in localStorage
                localStorage.setItem("firebaseToken", idToken);
                
                console.log("Firebase token stored:", idToken);

                navigate("/"); 
            }
        });

        return () => unsubscribe();  
    }, [navigate]);

    const userAuth = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            let userCredential;
            if (signState === "Sign In") {
                userCredential = await login(email, password);
            } else {
                userCredential = await signup(name, email, password);
            }

            // ✅ Get Firebase token after login/signup
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            // ✅ Store token in localStorage
            localStorage.setItem("firebaseToken", idToken);
            
            console.log("User authenticated & token stored:", idToken);

            setPassword("");  // ✅ Clear password field
            navigate("/");

        } catch (error) {
            console.error("Authentication error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='signin'>
            <div className="signin-form">
                <h1>{signState}</h1>
                <form onSubmit={userAuth}>
                    {signState === "Sign Up" && (
                        <input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            type="text" 
                            placeholder='Name' 
                            required
                        />
                    )}
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder='Email' 
                        required 
                    />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}  
                        placeholder='Password' 
                        required 
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Processing..." : signState}
                    </button>
                </form>
                <div className="form-switch">
                    {signState === "Sign In" ? (
                        <p>Don't have an account? <span onClick={() => setSignState("Sign Up")}>Sign Up</span></p>
                    ) : (
                        <p>Already have an account? <span onClick={() => setSignState("Sign In")}>Sign In</span></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignIn;
