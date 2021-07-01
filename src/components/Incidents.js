import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Incidents(props) {
  const { 
    user,
    setUser,
    userDocumentId,
    getUserData,
    serverURL,
    socket
  } = props;
  
  return (
    <div>
      <h3>Incidents</h3>
      {parceIncidents()}
    </div>
  )
  
    function parceIncidents() {
      if (user.Incidents) {
        return user.Incidents.map(incident => (
          <div key={incident.Time}>
            <p>{(new Date(Number(incident.Time))).toString()}</p>
            <p>{incident.Image}</p>
            <button id={incident.Time} onClick={deleteIncident}>Delete Incident</button>
          </div>
        ));
      } else {
        return <div></div>
      }
    }

    async function deleteIncident(e) {
      console.log("in delete")
      console.log(e.target.id)
      const response = await axios.delete(`http://${serverURL}/api/user/incident?id=${userDocumentId}&time=${e.target.id}`);
      const updatedUserData = await getUserData(userDocumentId);
      setUser(updatedUserData)
    }
}

export default Incidents;
