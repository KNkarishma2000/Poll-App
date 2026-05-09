import React, { useState, useEffect } from 'react';
import {  CheckCircle, AlertCircle, BarChart3, ArrowLeft, Filter, Download, Lock } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously,  onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
// Safely handle both the Canvas workspace and local/Vercel environments
const firebaseConfig = {
  apiKey: "AIzaSyBnvxcJwhJ1baCMoRfkizrCZB8e8w2u0Tc",
  authDomain: "ap-poll-system.firebaseapp.com",
  projectId: "ap-poll-system",
  storageBucket: "ap-poll-system.firebasestorage.app",
  messagingSenderId: "140737615449",
  appId: "1:140737615449:web:fb36a9c19a440b15d24348",
  measurementId: "G-P15LMDRB7W"
};



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "my-app";
// Authorized Admins
const ADMIN_EMAILS = ['karthikkotamraju9@gmail.com', 'helotune258@gmail.com'];

// Complete list of 175 AP Constituencies in Telugu
const AP_CONSTITUENCIES = [
  "ఇచ్ఛాపురం", "పలాస", "టెక్కలి", "పాతపట్నం", "శ్రీకాకుళం", "ఆమదాలవలస", "ఎచ్చెర్ల", "నరసన్నపేట",
  "రాజాం", "పాలకొండ", "కురుపాం", "పార్వతీపురం", "సాలూరు", "బొబ్బిలి", "చీపురుపల్లి", "గజపతినగరం", "నెల్లిమర్ల", "విజయనగరం", "శృంగవరపుకోట",
  "భీమిలి", "విశాఖపట్నం తూర్పు", "విశాఖపట్నం దక్షిణ", "విశాఖపట్నం ఉత్తర", "విశాఖపట్నం పశ్చిమ", "గాజువాక",
  "చోడవరం", "మాడుగుల", "అరకులోయ", "పాడేరు", "అనకాపల్లి", "పెందుర్తి", "ఎలమంచిలి", "పాయకరావుపేట",
  "నర్సీపట్నం", "తుని", "ప్రత్తిపాడు", "పిఠాపురం", "కాకినాడ గ్రామీణ", "కాకినాడ సిటీ", "పెద్దాపురం", "అనపర్తి", "జగ్గంపేట", "రంపచోడవరం",
  "ముమ్మిడివరం", "అమలాపురం", "రాజోలు", "గన్నవరం (కోనసీమ)", "కొత్తపేట", "రామచంద్రపురం", "రాజానగరం", "రాజమండ్రి సిటీ", "రాజమండ్రి రూరల్",
  "కొవ్వూరు", "నిడదవోలు", "ఆచంట", "పాలకొల్లు", "నరసాపురం", "భీమవరం", "ఉండి", "తణుకు", "తాడేపల్లిగూడెం", "ఉంగుటూరు", "దెందులూరు", "ఏలూరు", "గోపాలపురం", "పోలవరం", "చింతలపూడి",
  "తిరువూరు", "నూజివీడు", "గన్నవరం (కృష్ణా)", "గుడివాడ", "కైకలూరు", "పెడన", "మచిలీపట్నం", "అవనిగడ్డ", "పామర్రు", "పెనమలూరు", "విజయవాడ పశ్చిమ", "విజయవాడ సెంట్రల్", "విజయవాడ తూర్పు", "మైలవరం", "నందిగామ", "జగ్గయ్యపేట",
  "పెదకూరపాడు", "తాడికొండ", "మంగళగిరి", "పొన్నూరు", "వేమూరు", "రేపల్లె", "తెనాలి", "బాపట్ల", "ప్రత్తిపాడు (గుంటూరు)", "గుంటూరు పశ్చిమ", "గుంటూరు తూర్పు", "చిలకలూరిపేట", "నరసరావుపేట", "సత్తెనపల్లి", "వినుకొండ", "గురజాల", "మాచర్ల",
  "ఎర్రగొండపాలెం", "దర్శి", "పర్చూరు", "అద్దంకి", "చీరాల", "సంతనూతలపాడు", "ఒంగోలు", "కందుకూరు", "కొండపి", "మార్కాపురం", "గిద్దలూరు", "కనిగిరి",
  "కావలి", "ఆత్మకూరు", "కోవూరు", "నెల్లూరు సిటీ", "నెల్లూరు రూరల్", "సర్వేపల్లి", "గూడూరు", "సూళ్లూరుపేట", "వెంకటగిరి", "ఉదయగిరి",
  "బద్వేలు", "రాజంపేట", "కడప", "కోడూరు", "రాయచోటి", "పులివెందుల", "కమలాపురం", "జమ్మలమడుగు", "ప్రొద్దుటూరు", "మైదుకూరు",
  "ఆళ్లగడ్డ", "శ్రీశైలం", "నందికొట్కూరు", "కర్నూలు", "పాణ్యం", "నంద్యాల", "బనగానపల్లె", "డోన్", "పత్తికొండ", "కోడుమూరు", "ఎమ్మిగనూరు", "మంత్రాలయం", "ఆదోని", "ఆలూరు",
  "రాయదుర్గం", "ఉరవకొండ", "గుంతకల్లు", "తాడిపత్రి", "శింగనమల", "అనంతపురం అర్బన్", "కల్యాణదుర్గం", "రాప్తాడు", "మడకశిర", "హిందూపురం", "పెనుకొండ", "పుట్టపర్తి", "ధర్మవరం", "కదిరి",
  "తంబళ్లపల్లె", "పీలేరు", "మదనపల్లె", "పుంగనూరు", "చంద్రగిరి", "తిరుపతి", "శ్రీకాళహస్తి", "సత్యవేడు", "నగరి", "గంగాధర నెల్లూరు", "చిత్తూరు", "పూతలపట్టు", "పలమనేరు", "కుప్పం"
].sort((a, b) => a.localeCompare(b, 'te'));

// Mappings for all 175 MLAs (2024 Elections)
const MLA_MAP = {
  "ఇచ్ఛాపురం": "బెందాళం అశోక్", "పలాస": "గౌతు శిరీష", "టెక్కలి": "కింజరాపు అచ్చన్నాయుడు", "పాతపట్నం": "మామిడి గోవిందరావు", "శ్రీకాకుళం": "గొండు శంకర్", "ఆమదాలవలస": "కూన రవికుమార్", "ఎచ్చెర్ల": "నడుకుదిటి ఈశ్వరరావు", "నరసన్నపేట": "బగ్గు రమణమూర్తి",
  "రాజాం": "కోండ్రు మురళీమోహన్", "పాలకొండ": "నిమ్మక జయకృష్ణ", "కురుపాం": "తోయక జగదీశ్వరి", "పార్వతీపురం": "బోనెల విజయచంద్ర", "సాలూరు": "గుమ్మడి సంధ్యారాణి", "బొబ్బిలి": "ఆర్.వి.ఎస్.కె.కె. రంగారావు (బేబినాయన)", "చీపురుపల్లి": "కిమిడి కళావెంకటరావు", "గజపతినగరం": "కొండపల్లి శ్రీనివాస్", "నెల్లిమర్ల": "లోకం మాధవి", "విజయనగరం": "పూసపాటి అదితి విజయలక్ష్మి గజపతిరాజు", "శృంగవరపుకోట": "కోళ్ల లలిత కుమారి",
  "భీమిలి": "గంటా శ్రీనివాసరావు", "విశాఖపట్నం తూర్పు": "వెలగపూడి రామకృష్ణ బాబు", "విశాఖపట్నం దక్షిణ": "వంశీకృష్ణ శ్రీనివాస్", "విశాఖపట్నం ఉత్తర": "పెన్మెత్స విష్ణుకుమార్ రాజు", "విశాఖపట్నం పశ్చిమ": "పీజీవీఆర్ నాయుడు (గణబాబు)", "గాజువాక": "పల్లా శ్రీనివాసరావు",
  "చోడవరం": "కే.ఎస్.ఎన్.ఎస్. రాజు", "మాడుగుల": "బండారు సత్యనారాయణ మూర్తి", "అరకులోయ": "రేగం మత్స్యలింగం", "పాడేరు": "మత్స్యరాస విశ్వేశ్వరరాజు", "అనకాపల్లి": "కొణతాల రామకృష్ణ", "పెందుర్తి": "పంచకర్ల రమేష్ బాబు", "ఎలమంచిలి": "సుందరపు విజయ్ కుమార్", "పాయకరావుపేట": "వంగలపూడి అనిత",
  "నర్సీపట్నం": "చింతకాయల అయ్యన్నపాత్రుడు", "తుని": "యనమల దివ్య", "ప్రత్తిపాడు": "వరుపుల సత్యప్రభ", "పిఠాపురం": "పవన్ కళ్యాణ్", "కాకినాడ గ్రామీణ": "పంతం నానాజీ", "కాకినాడ సిటీ": "వనమాడి వెంకటేశ్వరరావు (కొండబాబు)", "పెద్దాపురం": "నిమ్మకాయల చినరాజప్ప", "అనపర్తి": "నల్లమిల్లి రామకృష్ణారెడ్డి", "జగ్గంపేట": "జ్యోతుల నెహ్రూ", "రంపచోడవరం": "మిరియాల శిరీషా దేవి",
  "ముమ్మిడివరం": "దాట్ల సుబ్బరాజు", "అమలాపురం": "అయితాబత్తుల ఆనందరావు", "రాజోలు": "దేవ వరప్రసాద్", "గన్నవరం (కోనసీమ)": "గిడ్డి సత్యనారాయణ", "కొత్తపేట": "బండారు ఆనందరావు", "రామచంద్రపురం": "వాసంశెట్టి సుభాష్", "రాజానగరం": "బత్తుల బలరామకృష్ణ", "రాజమండ్రి సిటీ": "ఆదిరెడ్డి శ్రీనివాస్", "రాజమండ్రి రూరల్": "గోరంట్ల బుచ్చయ్య చౌదరి",
  "కొవ్వూరు": "ముప్పిడి వెంకటేశ్వరరావు", "నిడదవోలు": "కందుల దుర్గేష్", "ఆచంట": "పితాని సత్యనారాయణ", "పాలకొల్లు": "నిమ్మల రామానాయుడు", "నరసాపురం": "బొమ్మిడి నాయకర్", "భీమవరం": "పులపర్తి రామాంజనేయులు", "ఉండి": "కనుమూరు రఘురామ కృష్ణరాజు", "తణుకు": "అరిమిల్లి రాధాకృష్ణ", "తాడేపల్లిగూడెం": "బోలిశెట్టి శ్రీనివాస్", "ఉంగుటూరు": "పత్సమట్ల ధర్మరాజు", "దెందులూరు": "చింతమనేని ప్రభాకర్", "ఏలూరు": "బడేటి రాధాకృష్ణయ్య (చంటి)", "గోపాలపురం": "మద్దిపాటి వెంకటరాజు", "పోలవరం": "చిర్రి బాలరాజు", "చింతలపూడి": "సాంగా రోషన్ కుమార్",
  "తిరువూరు": "కొలికపూడి శ్రీనివాసరావు", "నూజివీడు": "కొలుసు పార్థసారథి", "గన్నవరం (కృష్ణా)": "యార్లగడ్డ వెంకట్రావు", "గుడివాడ": "వెనిగండ్ల రాము", "కైకలూరు": "కామినేని శ్రీనివాసరావు", "పెడన": "కాగిత కృష్ణ ప్రసాద్", "మచిలీపట్నం": "కొల్లు రవీంద్ర", "అవనిగడ్డ": "మండలి బుద్ధ ప్రసాద్", "పామర్రు": "వర్ల కుమార్ రాజా", "పెనమలూరు": "బోడె ప్రసాద్", "విజయవాడ పశ్చిమ": "సుజనా చౌదరి", "విజయవాడ సెంట్రల్": "బోండా ఉమామహేశ్వరరావు", "విజయవాడ తూర్పు": "గద్దె రామమోహన్", "మైలవరం": "వసంత కృష్ణ ప్రసాద్", "నందిగామ": "తంగిరాల సౌమ్య", "జగ్గయ్యపేట": "శ్రీరామ్ రాజగోపాల్ (తాతయ్య)",
  "పెదకూరపాడు": "భాష్యం ప్రవీణ్", "తాడికొండ": "తెనాలి శ్రావణ్ కుమార్", "మంగళగిరి": "నారా లోకేష్", "పొన్నూరు": "ధూళిపాళ్ల నరేంద్ర కుమార్", "వేమూరు": "నక్కా ఆనందబాబు", "రేపల్లె": "అనగాని సత్యప్రసాద్", "తెనాలి": "నాదెండ్ల మనోహర్", "బాపట్ల": "వేగేశన నరేంద్ర వర్మ రాజు", "ప్రత్తిపాడు (గుంటూరు)": "బూర్ల రామాంజనేయులు", "గుంటూరు పశ్লগ্ন": "గల్లా మాధవి", "గుంటూరు తూర్పు": "మహమ్మద్ నసీర్", "చిలకలూరిపేట": "ప్రత్తిపాటి పుల్లారావు", "నరసరావుపేట": "చదలవాడ అరవింద బాబు", "సత్తెనపల్లి": "కన్నా లక్ష్మీనారాయణ", "వినుకొండ": "జి.వి. ఆంజనేయులు", "గురజాల": "యరపతినేని శ్రీనివాసరావు", "మాచర్ల": "జూలకంటి బ్రహ్మానంద రెడ్డి",
  "ఎర్రగొండపాలెం": "తాటిపర్తి చంద్రశేఖర్", "దర్శి": "బూచేపల్లి శివప్రసాద్ రెడ్డి", "పర్చూరు": "ఏలూరి సాంబశివరావు", "అద్దంకి": "గొట్టిపాటి రవికుమార్", "చీరాల": "మద్దులూరి మాలకొండయ్య", "సంతనూతలపాడు": "బీ.ఎన్. విజయ్ కుమార్", "ఒంగోలు": "దామచర్ల జనార్దనరావు", "కందుకూరు": "ఇంటూరి నాగేశ్వరరావు", "కొండపి": "డోలా శ్రీ బాల వీరాంజనేయ స్వామి", "మార్కాపురం": "కందుల నారాయణ రెడ్డి", "గిద్దలూరు": "ముత్తుముల అశోక్ రెడ్డి", "కనిగిరి": "ఉగ్ర నరసింహా రెడ్డి",
  "కావలి": "దగతాపాటి కావ్యకృష్ణారెడ్డి", "ఆత్మకూరు": "ఆనం రామనారాయణ రెడ్డి", "కోవూరు": "వేమిరెడ్డి ప్రశాంతి రెడ్డి", "నెల్లూరు సిటీ": "పి. నారాయణ", "నెల్లూరు రూరల్": "కోటంరెడ్డి శ్రీధర్ రెడ్డి", "సర్వేపల్లి": "సోమిరెడ్డి చంద్రమోహన్ రెడ్డి", "గూడూరు": "పాశం సునీల్ కుమార్", "సూళ్లూరుపేట": "నెలవల విజయశ్రీ", "వెంకటగిరి": "కురుగొండ్ల రామకృష్ణ", "ఉదయగిరి": "కాకర్ల సురేష్",
  "బద్వేలు": "దాసరి సుధ", "రాజంపేట": "ఆకేపాటి అమర్‌నాథ్ రెడ్డి", "కడప": "రెడ్డిప్పగారి మాధవి", "కోడూరు": "అరవ శ్రీధర్", "రాయచోటి": "మండిపల్లి రాంప్రసాద్ రెడ్డి", "పులివెందుల": "వై.ఎస్. జగన్ మోహన్ రెడ్డి", "కమలాపురం": "పుత్తా చైతన్య రెడ్డి", "జమ్మలమడుగు": "సి. ఆదినారాయణ రెడ్డి", "ప్రొద్దుటూరు": "నంద్యాల వరదరాజుల రెడ్డి", "మైదుకూరు": "పుట్టా సుధాకర్ యాదవ్",
  "ఆళ్లగడ్డ": "భూమా అఖిల ప్రియ", "శ్రీశైలం": "బుడ్డా రాజశేఖర రెడ్డి", "నందికొట్కూరు": "జి. జయసూర్య", "కర్నూలు": "టీజీ భరత్", "పాణ్యం": "గౌరు చరితా రెడ్డి", "నంద్యాల": "ఎన్.ఎం.డి. ఫరూక్", "బనగానపల్లె": "బీ.సీ. జనార్దన్ రెడ్డి", "డోన్": "కోట్ల జయసూర్యప్రకాశ్ రెడ్డి", "పత్తికొండ": "కే.ఈ. శ్యాంబాబు", "కోడుమూరు": "బొగ్గుల దస్తగిరి", "ఎమ్మిగనూరు": "బీ.వి. జయనాగేశ్వర రెడ్డి", "మంత్రాలయం": "వై. బాలనాగిరెడ్డి", "ఆదోని": "డాక్టర్ పార్థసారథి వాల్మీకి", "ఆలూరు": "బి. విరూపాక్షి",
  "రాయదుర్గం": "కాలవ శ్రీనివాసులు", "ఉరవకొండ": "పయ్యావుల కేశవ్", "గుంతకల్లు": "గుమ్మనూరు జయరాం", "తాడిపత్రి": "జేసీ అశ్మిత్ రెడ్డి", "శింగనమల": "బండారు శ్రావణి శ్రీ", "అనంతపురం అర్బన్": "దగ్గుపాటి వెంకటేశ్వర ప్రసాద్", "కల్యాణదుర్గం": "అమిలినేని సురేంద్ర బాబు", "రాప్తాడు": "పరిటాల సునీత", "మడకశిర": "ఎం.ఎస్. రాజు", "హిందూపురం": "నందమూరి బాలకృష్ణ", "పెనుకొండ": "ఎస్. సవిత", "పుట్టపర్తి": "పల్లె సింధూర రెడ్డి", "ధర్మవరం": "సత్య కుమార్ యాదవ్", "కదిరి": "కందికుంట వెంకట ప్రసాద్",
  "తంబళ్లపల్లె": "పెద్దిరెడ్డి ద్వారకానాథ్ రెడ్డి", "పీలేరు": "నల్లారి కిశోర్ కుమార్ రెడ్డి", "మదనపల్లె": "షాజహాన్ బాషా", "పుంగనూరు": "పెద్దిరెడ్డి రామచంద్రారెడ్డి", "చంద్రగిరి": "పులివర్తి వెంకట మణిప్రసాద్ (నాని)", "తిరుపతి": "ఆరణి శ్రీనివాసులు", "శ్రీకాళహస్తి": "బొజ్జల సుధీర్ రెడ్డి", "సత్యవేడు": "కోనేటి ఆదిమూలం", "నగరి": "గాలి భానుప్రకాష్", "గంగాధర నెల్లూరు": "వి.ఎం. థామస్", "చిత్తూరు": "గురజాల జగన్ మోహన్", "పూతలపట్టు": "కె. మురళీ మోహన్", "పలమనేరు": "ఎన్. అమర్నాథ్ రెడ్డి", "కుప్పం": "ఎన్. చంద్రబాబు నాయుడు"
};

export default function App() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', phone: '', constituency: '', comment: '' });
  const [captcha, setCaptcha] = useState({ n1: 0, n2: 0, input: '' });
  const [error, setError] = useState('');
  
  // Admin & Dashboard State
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [allVotes, setAllVotes] = useState([]);
  const [filterConstituency, setFilterConstituency] = useState('');

  // Firebase Authentication setup
 useEffect(() => {
     const initAuth = async () => {
       try {
         await signInAnonymously(auth);
       } catch (err) {
         console.error("Auth error:", err);
       }
     };
     initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Fetch data only if in dashboard view (Step 4)
  useEffect(() => {
    if (step === 4 && user) {
      const q = collection(db, 'artifacts', appId, 'public', 'data', 'ap_poll_results_2024');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const votes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by newest first
        votes.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));
        setAllVotes(votes);
      }, (err) => {
        console.error("Error fetching data:", err);
        setError("డేటాను లోడ్ చేయడంలో లోపం ఏర్పడింది. (Error loading data)");
      });
      return () => unsubscribe();
    }
  }, [step, user]);

  useEffect(() => {
    if (step === 1 || step === 5) generateCaptcha();
  }, [step]);

  const generateCaptcha = () => {
    setCaptcha({
      n1: Math.floor(Math.random() * 10) + 1,
      n2: Math.floor(Math.random() * 10) + 1,
      input: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && value.length > 10) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleStartPoll = async (e) => {
  e.preventDefault();
  setError('');

  if (!formData.name.trim()) {
    return setError('దయచేసి మీ పేరు నమోదు చేయండి.');
  }

  if (!/^[0-9]{10}$/.test(formData.phone)) {
    return setError('దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.');
  }

  if (!formData.constituency) {
    return setError('దయచేసి మీ నియోజకవర్గం ఎంచుకోండి.');
  }

  if (parseInt(captcha.input) !== (captcha.n1 + captcha.n2)) {
    setError('క్యాప్చా తప్పు. దయచేసి మళ్లీ ప్రయత్నించండి.');

    generateCaptcha();

    setCaptcha(prev => ({
      ...prev,
      input: ''
    }));

    return;
  }

  try {
    // Check duplicate phone number BEFORE entering poll
    const votesRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'ap_poll_results_2024'
    );

    const q = query(votesRef, where("phone", "==", formData.phone));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return setError(
        'ఈ మొబైల్ నంబర్‌తో ఇప్పటికే ఓటు నమోదు చేయబడింది.'
      );
    }

    // Move to poll screen
    setStep(2);

  } catch (err) {
    console.error(err);

    setError(
      'డేటా చెక్ చేయడంలో లోపం ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.'
    );
  }
};

  const currentMLA = MLA_MAP[formData.constituency] || `${formData.constituency} ఎమ్మెల్యే`;

 const handleVote = async (optionIndex) => {
  if (!user) {
    setError('సర్వర్ కు కనెక్ట్ కాలేదు. దయచేసి పేజీని రీఫ్రెష్ చేయండి.');
    return;
  }

  try {
    // Reference to collection
    const votesRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'ap_poll_results_2024'
    );

   

    // Create vote record
    const voteRecord = {
      name: formData.name,
      phone: formData.phone,
      constituency: formData.constituency,
      mlaName: currentMLA,
      optionId: optionIndex,
      comment: formData.comment,
      timestamp: new Date().toLocaleString(),
      timestampMs: Date.now()
    };

    // Save vote
    await addDoc(votesRef, voteRecord);

    setStep(3);

  } catch (err) {
    console.error("Error adding document: ", err);
    setError('ఓటు నమోదు చేయడంలో లోపం. దయచేసి మళ్లీ ప్రయత్నించండి.');
  }
};

  const handleAdminVerify = (e) => {
    e.preventDefault();
    setError('');
    
    if (ADMIN_EMAILS.includes(adminEmailInput.trim().toLowerCase())) {
      setIsAdmin(true);
      setStep(4);
      setFilterConstituency('');
    } else {
      setError('మీకు యాక్సెస్ లేదు. దయచేసి సరైన అడ్మిన్ ఈమెయిల్ నమోదు చేయండి.');
    }
  };

  const exportToCSV = () => {
    const headers = ['తేదీ & సమయం', 'పేరు (Name)', 'ఫోన్ నంబర్', 'నియోజకవర్గం', 'ఎమ్మెల్యే (MLA)', 'ఓటు (Vote)', 'వ్యాఖ్య (Comment)'];
    const optionLabels = { 1: 'బాగుంది', 2: 'బాగోలేదు', 3: 'పర్వాలేదు', 4: 'ఏమీ చెప్పలేం' };

    const csvData = filteredVotes.map(v => [
      `"${v.timestamp}"`,
      `"${v.name}"`,
      `"${v.phone}"`,
      `"${v.constituency}"`,
      `"${v.mlaName}"`,
      `"${optionLabels[v.optionId]}"`,
      `"${(v.comment || '').replace(/"/g, '""')}"` // Escape inner quotes
    ]);

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    
    // Create a Blob with BOM for excel to read utf8 properly
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AP_Poll_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredVotes = filterConstituency 
    ? allVotes.filter(vote => vote.constituency === filterConstituency) 
    : allVotes;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      
      {/* STEP 1: VERIFICATION FORM */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-4 relative">
          {/* Admin Login Trigger */}
          <button 
            onClick={() => setStep(5)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            title="Admin Login"
          >
            <Lock className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold text-center text-red-700 mb-6 border-b pb-4 mt-2">
            ఆంధ్రప్రదేశ్ పబ్లిక్ పోల్
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleStartPoll} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">మీ పేరు</label>
              <input 
                type="text" name="name" 
                value={formData.name} onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="మీ పూర్తి పేరు"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">మొబైల్ నంబర్ (10 అంకెలు)</label>
              <input 
                type="tel" name="phone" pattern="[0-9]*"
                value={formData.phone} onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ex: 9876543210"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">నియోజకవర్గం</label>
              <select 
                name="constituency" 
                value={formData.constituency} onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="">-- ఎంచుకోండి --</option>
                {AP_CONSTITUENCIES.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                క్యాప్చా పరిష్కరించండి: {captcha.n1} + {captcha.n2} = ?
              </label>
              <input 
                type="number" 
                value={captcha.input} onChange={(e) => setCaptcha({...captcha, input: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="సమాధానం"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-4 shadow-lg disabled:opacity-50"
              disabled={!user}
            >
              {user ? "పోల్ ప్రారంభించండి" : "కనెక్ట్ అవుతోంది..."}
            </button>
          </form>

          {/* View Results Button for Normal Users */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <button 
              onClick={() => { setStep(4); setFilterConstituency(''); }}
              className="inline-flex items-center text-blue-700 hover:text-blue-900 font-bold"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              లైవ్ ఫలితాలు (Live Results)
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: IMMERSIVE POLL INTERFACE */}
      {step === 2 && (
        <div className="fixed inset-0 w-full h-full bg-[radial-gradient(circle,_#8b0000_0%,_#3a0000_100%)] flex flex-col items-center justify-center p-4 overflow-y-auto z-50">
          <div className="w-full max-w-2xl bg-transparent relative pb-10 mt-auto mb-auto">
            
            <div className="flex justify-between items-end mb-10 px-2 border-b border-red-800/50 pb-4">
              <h1 className="text-white text-3xl font-serif font-bold tracking-wide drop-shadow-md">
                Public Poll
              </h1>
              <div className="text-right">
                <h2 className="text-white text-xl md:text-2xl font-semibold border-b-2 border-white pb-1 tracking-wide">
                  {formData.constituency} నియోజకవర్గం
                </h2>
              </div>
            </div>

            <div className="flex flex-col items-center mt-4 mb-6">
              <div className="bg-gradient-to-r from-red-900 to-red-800 border-2 border-[#FFD700] rounded-xl px-8 py-4 shadow-[0_0_15px_rgba(255,215,0,0.3)] min-w-[300px]">
                <p className="text-white text-2xl md:text-3xl tracking-wide font-bold drop-shadow-lg text-center">
                  {currentMLA} <span className="text-[#FFD700] text-xl block sm:inline mt-2 sm:mt-0">(M.L.A)</span>
                </p>
              </div>
            </div>

            <div className="mt-10 mb-8 text-center px-4">
              <h3 className="text-[#FFD700] text-2xl md:text-3xl font-bold leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                మీ నియోజకవర్గ ఎమ్మెల్యే పని తీరుపై మీ <br className="hidden md:block" /> అభిప్రాయం ఏమిటి...?
              </h3>
            </div>

            <div className="px-4 mt-2 max-w-lg mx-auto w-full">
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="మీ అభిప్రాయాన్ని ఇక్కడ రాయండి (Optional Comment)"
                className="w-full px-4 py-3 border border-[#4b60a3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] bg-white/10 text-white placeholder-gray-300 backdrop-blur-sm"
                rows="2"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 mt-8">
              {[
                { id: 1, label: 'బాగుంది' },
                { id: 2, label: 'బాగోలేదు' },
                { id: 3, label: 'పర్వాలేదు' },
                { id: 4, label: 'ఏమీ చెప్పలేం' }
              ].map(opt => (
                <button key={opt.id} onClick={() => handleVote(opt.id)} className="group relative flex items-center py-4 px-6 bg-gradient-to-r from-[#1e2a56] to-[#2b3c7a] rounded-full border border-[#4b60a3] shadow-[0_5px_15px_rgba(0,0,0,0.5)] transform transition hover:scale-105 active:scale-95">
                  <span className="text-white text-xl font-bold mr-3 drop-shadow-md group-hover:text-[#FFD700]">{opt.id}.</span>
                  <span className="text-white text-xl font-semibold tracking-wide drop-shadow-md">{opt.label}</span>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS SCREEN */}
      {step === 3 && (
        <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-sm mx-4 transform transition-all scale-100">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ధన్యవాదాలు!</h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            {formData.constituency} నియోజకవర్గం పై మీ అభిప్రాయం విజయవంతంగా నమోదు చేయబడింది.
          </p>
          <button 
            onClick={() => { setStep(1); setFormData({name: '', phone: '', constituency: '', comment: ''}); generateCaptcha(); }}
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg"
          >
            మరొక ఓటు వేయండి
          </button>
          
          <div className="mt-4 pt-4 border-t">
            <button 
              onClick={() => { setStep(4); setFilterConstituency(''); }}
              className="text-blue-600 font-semibold hover:underline inline-flex items-center"
            >
              <BarChart3 className="w-5 h-5 mr-1" /> ఫలితాలు చూడండి
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: ADMIN VERIFICATION */}
      {step === 5 && (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-4">
          <div className="flex items-center mb-6 border-b pb-4">
            <Lock className="w-6 h-6 text-blue-700 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">అడ్మిన్ లాగిన్</h2>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleAdminVerify} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">అడ్మిన్ ఈమెయిల్ (Admin Email)</label>
              <input 
                type="email" 
                value={adminEmailInput} 
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="enter admin email id"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-4 shadow-lg"
            >
              Verify & View Results
            </button>
          </form>

          <div className="mt-4 text-center">
            <button 
              onClick={() => setStep(1)}
              className="text-gray-500 hover:text-gray-800 font-semibold text-sm"
            >
              వెనుకకు (Cancel)
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: LIVE RESULTS DASHBOARD (SECURED) */}
      {step === 4 && (
        <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl w-full max-w-6xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b pb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-red-700" />
              పోల్ ఫలితాలు {isAdmin && "- అడ్మిన్ ప్యానెల్"}
            </h2>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button 
                  onClick={exportToCSV}
                  className="flex items-center text-green-700 hover:text-green-900 bg-green-50 px-4 py-2 rounded-lg font-semibold border border-green-200"
                >
                  <Download className="w-5 h-5 mr-2" /> Excel కు డౌన్‌లోడ్ చేయండి
                </button>
              )}
              <button 
                onClick={() => { 
                  setStep(1); 
                  if (isAdmin) {
                    setIsAdmin(false);
                    setAdminEmailInput('');
                  }
                  generateCaptcha(); 
                }}
                className="flex items-center text-gray-600 hover:text-red-700 font-semibold"
              >
                <ArrowLeft className="w-5 h-5 mr-1" /> వెనుకకు ({isAdmin ? 'Logout' : 'Back'})
              </button>
            </div>
          </div>

          {/* Constituency Filter */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center text-blue-800 font-semibold">
              <Filter className="w-5 h-5 mr-2" />
              నియోజకవర్గం వారీగా (Filter by Constituency):
            </div>
            <select 
              value={filterConstituency}
              onChange={(e) => setFilterConstituency(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- అన్ని నియోజకవర్గాలు (All) --</option>
              {AP_CONSTITUENCIES.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Stats Summary */}
          {(() => {
            const total = filteredVotes.length;
            const c1 = filteredVotes.filter(v => v.optionId === 1).length;
            const c2 = filteredVotes.filter(v => v.optionId === 2).length;
            const c3 = filteredVotes.filter(v => v.optionId === 3).length;
            const c4 = filteredVotes.filter(v => v.optionId === 4).length;
            
            const p1 = total === 0 ? 0 : ((c1 / total) * 100).toFixed(1);
            const p2 = total === 0 ? 0 : ((c2 / total) * 100).toFixed(1);
            const p3 = total === 0 ? 0 : ((c3 / total) * 100).toFixed(1);
            const p4 = total === 0 ? 0 : ((c4 / total) * 100).toFixed(1);

            return (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 text-center">
                  <h4 className="text-gray-500 text-sm font-bold">మొత్తం (Total)</h4>
                  <p className="text-3xl font-black text-gray-800">{total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                  <h4 className="text-gray-500 text-sm font-bold">బాగుంది (1)</h4>
                  <p className="text-2xl font-bold text-green-700">
                    {c1} <span className="text-sm font-normal text-green-600 block sm:inline">({p1}%)</span>
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                  <h4 className="text-gray-500 text-sm font-bold">బాగోలేదు (2)</h4>
                  <p className="text-2xl font-bold text-red-700">
                    {c2} <span className="text-sm font-normal text-red-600 block sm:inline">({p2}%)</span>
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-center">
                  <h4 className="text-gray-500 text-sm font-bold">పర్వాలేదు (3)</h4>
                  <p className="text-2xl font-bold text-yellow-700">
                    {c3} <span className="text-sm font-normal text-yellow-600 block sm:inline">({p3}%)</span>
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center col-span-2 md:col-span-1">
                  <h4 className="text-gray-500 text-sm font-bold">చెప్పలేం (4)</h4>
                  <p className="text-2xl font-bold text-gray-600">
                    {c4} <span className="text-sm font-normal text-gray-500 block sm:inline">({p4}%)</span>
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Detailed Data Table */}
          <div className="overflow-y-auto flex-1 border rounded-lg">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-100 sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="p-3 border-b font-semibold text-gray-700">తేదీ & సమయం</th>
                  <th className="p-3 border-b font-semibold text-gray-700">పేరు (Name)</th>
                  <th className="p-3 border-b font-semibold text-gray-700">ఫోన్ నంబర్</th>
                  <th className="p-3 border-b font-semibold text-gray-700">నియోజకవర్గం</th>
                  <th className="p-3 border-b font-semibold text-gray-700">ఎమ్మెల్యే (MLA)</th>
                  <th className="p-3 border-b font-semibold text-gray-700">ఓటు (Vote)</th>
                  <th className="p-3 border-b font-semibold text-gray-700">వ్యాఖ్య (Comment)</th>
                </tr>
              </thead>
              <tbody>
                {filteredVotes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-500">
                      {filterConstituency 
                        ? `${filterConstituency} నియోజకవర్గానికి ఇంకా ఓట్లు లేవు.` 
                        : "ఇప్పటివరకు ఎవరూ ఓటు వేయలేదు. (No votes yet)"}
                    </td>
                  </tr>
                ) : (
                  filteredVotes.map((vote, idx) => {
                    const optionLabels = {
                      1: <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium whitespace-nowrap">బాగుంది</span>,
                      2: <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium whitespace-nowrap">బాగోలేదు</span>,
                      3: <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium whitespace-nowrap">పర్వాలేదు</span>,
                      4: <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm font-medium whitespace-nowrap">ఏమీ చెప్పలేం</span>
                    };
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-b text-sm text-gray-600 whitespace-nowrap">{vote.timestamp}</td>
                        <td className="p-3 border-b font-medium">{vote.name}</td>
                        <td className="p-3 border-b text-gray-600 tracking-wider whitespace-nowrap">{vote.phone}</td>
                        <td className="p-3 border-b text-blue-700 font-medium whitespace-nowrap">{vote.constituency}</td>
                        <td className="p-3 border-b text-gray-800 text-sm whitespace-nowrap">{vote.mlaName}</td>
                        <td className="p-3 border-b">{optionLabels[vote.optionId]}</td>
                        <td className="p-3 border-b text-sm text-gray-700 max-w-xs truncate" title={vote.comment}>{vote.comment || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
