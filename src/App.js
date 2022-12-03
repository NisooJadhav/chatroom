import React, { useRef, useState } from 'react'
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/analytics';
import 'firebase/analytics'

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//initialising app to identify it
firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "loquacious-007.firebaseapp.com",
  projectId: "loquacious-007",
  storageBucket: "loquacious-007.appspot.com",
  messagingSenderId: "1019345291878",
  appId: "1:1019345291878:web:51e2df4228e1c41f1b3ba7",
  measurementId: "G-B4WDX5VM18"
})

//sdks as global variables
const auth = firebase.auth()
const firestore = firebase.firestore()
//const analytics = firebase.analytics()

function App() {

  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <h1>Chat Room</h1>
        <SignOut />
      </header>

      <section>
        {user ? <Chatroom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }

  return (
    <>
      <button onClick={signInWithGoogle} >
        Sign In with Google
      </button>
      <p>do not violate community guidelines</p>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function Chatroom() {
  const dummy = useRef()
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)
  const [messages] = useCollectionData(query, { idField: 'id' })
  const [formValue, setFormValue] = useState('')

  const sendMessage = async (e) => {
    e.preventDefault()

    const { uid, photoURL } = auth.currentUser

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('')
    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </div>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="type something" />
        <button type="submit" disabled={!formValue}>Submit</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="avatar"
        />
        <p>{text}</p>
      </div>
    </>
  )
}
export default App; 
