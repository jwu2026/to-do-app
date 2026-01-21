import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAAkr3fjw63KLdLjHCDSs69SrQ6TrQJ2LA',
  authDomain: 'to-do-list-b36f2.firebaseapp.com',
  projectId: 'to-do-list-b36f2',
  storageBucket: 'to-do-list-b36f2.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
