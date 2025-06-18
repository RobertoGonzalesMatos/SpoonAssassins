import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const joinForm = document.getElementById("joinForm");
const userInfo = document.getElementById("userInfo");
const usernameDisplay = document.getElementById("username");
const adminPanel = document.getElementById("adminPanel");
const modal = document.getElementById("modal");
const modalTargetName = document.getElementById("modalTargetName");

let currentUser;

checkIfGameActive();

async function checkIfGameActive() {
  const playerDocs = await getDocs(collection(db, "players"));
  if (playerDocs.empty) {
    localStorage.removeItem("spoonPlayer");
    return;
  }

  const savedName = localStorage.getItem("spoonPlayer");
  if (savedName) {
    currentUser = { uid: savedName, displayName: savedName };
    usernameDisplay.textContent = currentUser.displayName;
    userInfo.classList.remove("hidden");
    joinForm.classList.add("hidden");
    if (savedName === "Roberto Gonzales") {
      adminPanel.classList.remove("hidden");
    }
    await updatePlayerCount();
    checkForTarget();
  }
}

joinForm.onsubmit = async (e) => {
  e.preventDefault();
  const first = document.getElementById("firstName").value.trim();
  const last = document.getElementById("lastName").value.trim();
  if (!first || !last) return alert("Please fill in both fields.");
  const fullName = `${first} ${last}`;
  currentUser = { uid: fullName, displayName: fullName };
  localStorage.setItem("spoonPlayer", fullName);
  usernameDisplay.textContent = currentUser.displayName;
  userInfo.classList.remove("hidden");
  joinForm.classList.add("hidden");

  if (fullName === "Roberto Gonzales") {
    adminPanel.classList.remove("hidden");
  }

  const playerDocRef = doc(db, "players", currentUser.uid);
  const playerDocSnap = await getDoc(playerDocRef);
  if (!playerDocSnap.exists()) {
    await setDoc(playerDocRef, {
      name: currentUser.displayName,
    });
    await updatePlayerCount();
  }

  checkForTarget();
};

async function updatePlayerCount() {
  const snapshot = await getDocs(collection(db, "players"));
  document.getElementById("playerCount").textContent = snapshot.size;
}

async function checkForWinner() {
  const snapshot = await getDocs(collection(db, "players"));
  if (snapshot.size === 1) {
    const winner = snapshot.docs[0].id;
    alert(`🎉 The winner is ${winner}!`);
    showTargetModal(`🎉 Winner: ${winner}`);
  }
}


window.eliminatePlayer = async () => {
  const first = document.getElementById("elimFirstName").value.trim();
  const last = document.getElementById("elimLastName").value.trim();
  const fullName = `${first} ${last}`;

  const elimDocRef = doc(db, "assignments", fullName);
  const elimDocSnap = await getDoc(elimDocRef);

  if (!elimDocSnap.exists()) {
    alert("That player doesn't have an assignment.");
    return;
  }

  const eliminatedTarget = elimDocSnap.data().target;

  // Find who had this eliminated person as their target
  const allAssignments = await getDocs(collection(db, "assignments"));
  let assassin = null;

  allAssignments.forEach((docSnap) => {
    if (docSnap.data().target === fullName) {
      assassin = docSnap.id;
    }
  });

  if (assassin) {
    await setDoc(doc(db, "assignments", assassin), {
      target: eliminatedTarget,
    });
  }

  await deleteDoc(doc(db, "assignments", fullName));
  await deleteDoc(doc(db, "players", fullName));

  alert(`${fullName} eliminated. ${assassin ? "Reassigned target to " + assassin : "No assassin found."}`);

  await updatePlayerCount();
  await checkForWinner();
};


async function checkForTarget() {
  const docRef = doc(db, "assignments", currentUser.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const target = docSnap.data().target;
    showTargetModal(target);
  }
}

function showTargetModal(name) {
  modal.classList.remove("hidden");
  modalTargetName.textContent = name;
}

window.closeModal = () => {
  modal.classList.add("hidden");
};

window.assignTargets = async () => {
  const snapshot = await getDocs(collection(db, "players"));
  const players = [];
  snapshot.forEach((doc) => {
    players.push({ uid: doc.id, name: doc.data().name });
  });

  if (players.length < 2) {
    alert("Need at least 2 players.");
    return;
  }

  const shuffled = players.sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length; i++) {
    const assassin = shuffled[i];
    const target = shuffled[(i + 1) % shuffled.length];
    await setDoc(doc(db, "assignments", assassin.uid), {
      target: target.name,
    });
  }

  // After assigning, show the current user's target immediately if applicable
  checkForTarget();
};

window.resetGame = async () => {
  const playerDocs = await getDocs(collection(db, "players"));
  for (const docSnap of playerDocs.docs) {
    await deleteDoc(doc(db, "players", docSnap.id));
  }
  const assignmentDocs = await getDocs(collection(db, "assignments"));
  for (const docSnap of assignmentDocs.docs) {
    await deleteDoc(doc(db, "assignments", docSnap.id));
  }

  localStorage.removeItem("spoonPlayer");
  alert("Game reset! All players have been logged out.");
  window.location.href = window.location.href;
};
