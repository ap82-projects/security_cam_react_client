import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Incidents from './Incidents';
import SecurityCam from './SecurityCam';
import { jsonEval } from '@firebase/util';
const serverURL = process.env.SERVER_URL || 'localhost:8080';

function MainPage(props) {
  const { userAuth, auth } = props;
  // const [socket, setSocket] = useState(io(`ws://${serverURL}/socket.io/`, { transports: ['websocket'] }));
  const [socket, setSocket] = useState();
  const [userGoogleId, setUserGoogleId] = useState(userAuth.providerData[0].uid);
  const [userGoogleName, setUserGoogleName] = useState(userAuth.displayName);
  const [userGoogleEmail, setUserGoogleEmail] = useState(userAuth.email);
  const [userGooglePhone, setUserGooglePhone] = useState(userAuth.phoneNumber);
  const [userDocumentId, setUserDocumentId] = useState("")
  const [user, setUser] = useState({});
  const [asSecurityCam, setAsSecurityCam] = useState(false);
  const [watchSecurityCam, setWatchSecurityCam] = useState(false);

  useEffect(async () => {
    setSocket(io(`ws://${serverURL}/socket.io/`, { transports: ['websocket'] }))
    const existingUserDoc = await getUserDocId(userGoogleId);
    if (existingUserDoc && existingUserDoc.id) {
      setUserDocumentId(existingUserDoc.id)
      const userData = await getUserData(existingUserDoc.id);
      setUser(userData)
      /////////////////////////////////////////
      // Possible error handling functionality
      // if (userData) {
      //   setUser(userData);
      // } else {
      //   // ERROR
      //   auth.signOut()
      // }
      /////////////////////////////////////////
    } else {
      // User doesn't exist in database
      const newUserDoc = await addUser();
      setUserDocumentId(newUserDoc.id)
      const newUserData = await getUserData(newUserDoc.id)
      setUser(newUserData);
      /////////////////////////////////////////
      // Possible error handling functionality
      // if (newUserDoc && newUserDoc.id) {
      //   setUserDocumentId(newUserDoc.id)
      //   setUser(await getUserData(newUserDoc.id));
      // } else {
      //   // ERROR, user not added
      //   auth.signOut();
      // }
      /////////////////////////////////////////
    }
    console.log('userDocumentId')
    console.log(userDocumentId)
    console.log('user.email')
    console.log(user.email)
  }, []);

  
  return (
    <div className="MainPage">
      <div>
        {/* HEADER DIV */}
        {/* INCLUDE OPTION TO CHANGE TO CAMERA MODE */}
        <p>User document ID {userDocumentId}</p>
        <p>UserData {JSON.stringify(user)}</p>
        {/* <p>{JSON.stringify(socket)}</p> */}
        <button variant="danger" onClick={() => auth.signOut()}>Sign Out</button>
        <button onClick={watchSecurityCam ? cutSecurityFeed : viewSecurityFeed}>
          {watchSecurityCam ? 'Cut Security Feed' : 'View Security Feed'}
        </button>
        <button onClick={() => setAsSecurityCam(!asSecurityCam)}>
          {asSecurityCam ? 'Stop Monitoring' : 'Security Cam'}
        </button>
      </div>
      <div>
        {/* INCIDENTS DIV */}
        {asSecurityCam
          ? <SecurityCam user={user} socket={socket} />
          : watchSecurityCam
            ? <div>twilio video</div>
            : <Incidents
          user={user}
          socket={socket}
          setUser={setUser}
          userDocumentId={userDocumentId}
          getUserData={getUserData}
          serverURL={serverURL}
          />
        }
      </div>
    </div>
  )
  
  async function getUserDocId(googleId) {
    const response = await axios.get(`http://${serverURL}/api/user/google?id=${googleId}`);
    return response.data;
  }

  async function getUserData(docID) {
    console.log('userDocumentId in getUserData')
    console.log(userDocumentId)
    // const response = await axios.get(`http://${serverURL}/api/user?id=${userDocumentId}`);
    const response = await axios.get(`http://${serverURL}/api/user?id=${docID}`);
    return response.data;
  }

  async function addUser() {
    const response = await axios.post(`http://${serverURL}/api/user`, {
      'email': userGoogleEmail,
      'googleid': userGoogleId,
      'incidents': [],
      'name': userGoogleName,
      'phone': userGooglePhone,
      'watching': false
    });
    return response.data;
  }

  async function viewSecurityFeed() {
    setWatchSecurityCam(true);
    console.log(socket)
    socket.emit('/watch', {'Text': 'hi'})
    // const response = await axios.put(`http://${serverURL}/api/user/watching?id=${userDocumentId}`, {
    //   'watching': true
    // });
  }

  async function cutSecurityFeed() {
    setWatchSecurityCam(false);
    // const response = await axios.put(`http://${serverURL}/api/user/watching?id=${userDocumentId}`, {
    //   'watching': false
    // });
  }

  async function testAddIncident() {
    const response = await axios.put(`http://${serverURL}/api/user/incident?id=${userDocumentId}`, {
      'image': 'this image',
      'time': String(Date.now())
    });
  }

  // async function testDeleteIncident(time) {
  async function testDeleteIncident() {
    const time = 'this time';
    const response = await axios.delete(`http://${serverURL}/api/user/incident?id=${userDocumentId}&time=${encodeURIComponent(time)}`);
  }
}

export default MainPage;
