import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBvI4GblyiCQZ-8KAvTXL4K3JTy3hB_t3s",
  authDomain: "isdfchatbot.firebaseapp.com",
  projectId: "isdfchatbot",
  storageBucket: "isdfchatbot.appspot.com",
  messagingSenderId: "817713200679",
  appId: "1:817713200679:web:2ae0009877c97953545802",
  measurementId: "G-4GVWF6XR5Y"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <MatrixBackground />
      <header>
        <h1>🧑🏻‍💻💬</h1>
        <SignOut />
      </header>

      <section>
      
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function MatrixBackground({ timeout = 50 }) {
  const canvas = useRef();

  useEffect(() => {
      const context = canvas.current.getContext('2d');

      const width = document.body.offsetWidth;
      const height = document.body.offsetHeight;
      canvas.current.width = width;
      canvas.current.height = height;

      context.fillStyle = '#000';
      context.fillRect(0, 0, width, height);

      const columns = Math.floor(width / 20) + 1;
      const yPositions = Array.from({ length: columns }).fill(0);

      context.fillStyle = '#000';
      context.fillRect(0, 0, width, height);

      const matrixEffect = () => {
          context.fillStyle = '#0001';
          context.fillRect(0, 0, width, height);

          context.fillStyle = '#0f0';
          context.font = '15pt monospace';

          yPositions.forEach((y, index) => {
              const text = String.fromCharCode(Math.random() * 128);
              const x = index * 20;
              context.fillText(text, x, y);

              if (y > 100 + Math.random() * 10000) {
                  yPositions[index] = 0;
              } else {
                  yPositions[index] = y + 20;
              }
          });
      };

      const interval = setInterval(matrixEffect, timeout);
      return () => {
          clearInterval(interval);
      };
  }, [canvas, timeout]);

  return (
      <div
          style={{
              background: '#000000',
              overflow: 'hidden',
              position: 'fixed',
              height: '100%',
              width: '100%',
              zIndex: -1,
              left: '0',
              top: '0',
          }}
      >
          <canvas
              ref={canvas}
          />
      </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}><i class="material-icons">&#xe163;</i></button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="avatar" />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
