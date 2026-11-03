import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';


type Page = 'login' | 'register' | 'driver' | 'active' | 'history' | 'details' | 'analytics' | 'links' | 'parent';
type Trip = { id: number; date: string; start: string; end: string; minutes: number; distance: number; score: number; speeding: number; braking: number; acceleration: number };
const DEMO_TRIPS: Trip[] = [
  { id: 1, date: 'Nov 2, 2026', start: '8:15 AM', end: '8:43 AM', minutes: 28, distance: 18.4, score: 88, speeding: 1, braking: 0, acceleration: 1 },
  { id: 2, date: 'Nov 1, 2026', start: '5:40 PM', end: '6:15 PM', minutes: 35, distance: 22.1, score: 82, speeding: 1, braking: 1, acceleration: 1 },
  { id: 3, date: 'Nov 1, 2026', start: '8:05 AM', end: '8:27 AM', minutes: 22, distance: 12.6, score: 90, speeding: 0, braking: 0, acceleration: 1 },
  { id: 4, date: 'Oct 30, 2026', start: '6:10 PM', end: '6:29 PM', minutes: 19, distance: 9.8, score: 84, speeding: 1, braking: 1, acceleration: 0 },
  { id: 5, date: 'Oct 29, 2026', start: '8:20 AM', end: '8:45 AM', minutes: 25, distance: 14.1, score: 86, speeding: 0, braking: 0, acceleration: 1 },
];
const C = { black: '#262626', gray: '#666666', line: '#BABABA', light: '#F2F2F2', white: '#FFFFFF' };
function Button({ text, onPress, outline = false }: { text: string; onPress: () => void; outline?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.button, outline && styles.outlineButton]}><Text style={[styles.buttonText, outline && styles.outlineButtonText]}>{text}</Text></Pressable>;
}
function Section({ children }: { children: React.ReactNode }) { return <View style={styles.section}>{children}</View>; }
function Box({ children }: { children: React.ReactNode }) { return <View style={styles.card}>{children}</View>; }
function Heading({ children }: { children: React.ReactNode }) { return <Text style={styles.sectionTitle}>{children}</Text>; }
function Field({ title, value, onChange, placeholder, secure = false }: { title: string; value: string; onChange: (text: string) => void; placeholder: string; secure?: boolean }) {
  return <View style={{ marginBottom: 19 }}><Text style={styles.label}>{title}</Text><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#787878" secureTextEntry={secure} autoCapitalize={title === 'Email' || title === 'Parent email' ? 'none' : 'sentences'} style={styles.input} /></View>;
}
function TabBar({ page, navigate, parent }: { page: Page; navigate: (p: Page) => void; parent: boolean }) {
  const tabs: { page: Page; label: string; symbol: string }[] = parent ? [{ page: 'parent', label: 'Home', symbol: '⌂' }, { page: 'links', label: 'Links', symbol: '↗' }] : [
    { page: 'driver', label: 'Home', symbol: '⌂' }, { page: 'history', label: 'Trips', symbol: '☷' }, { page: 'analytics', label: 'Analytics', symbol: '▥' }, { page: 'links', label: 'Links', symbol: '↗' }
  ];
  return <View style={styles.tabs}>{tabs.map(t => <Pressable key={t.label} onPress={() => navigate(t.page)} style={[styles.tab, (page === t.page || (page === 'active' && t.page === 'driver') || (page === 'details' && t.page === 'history')) && styles.activeTab]}><Text style={styles.tabSymbol}>{t.symbol}</Text><Text style={styles.tabLabel}>{t.label}</Text></Pressable>)}</View>;
}
export default function App() {
  const [page, setPage] = useState<Page>('login');
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [parent, setParent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(true);
  const [approved, setApproved] = useState(true);
  const [trips, setTrips] = useState<Trip[]>(DEMO_TRIPS);
  const [chosen, setChosen] = useState<Trip>(DEMO_TRIPS[0]);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [range, setRange] = useState<'Last 7 days' | 'All trips'>('Last 7 days');

  //firebase authentication check
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setIsAuthenticated(!!user);

    if (user) {
      setPage('driver');
    } else {
      setParent(false);
      setPage('login');
    }

    setAuthLoading(false);
  });

  return unsubscribe;
}, []);


  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [started]);
  const totalKm = trips.reduce((sum, t) => sum + t.distance, 0);
  const score = Math.round(trips.reduce((sum, t) => sum + t.score, 0) / Math.max(1, trips.length));
  const events = { speeding: trips.reduce((s,t)=>s+t.speeding,0), braking: trips.reduce((s,t)=>s+t.braking,0), acceleration: trips.reduce((s,t)=>s+t.acceleration,0) };
  const displayTime = `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const beginTrip = () => { setSeconds(0); setStarted(true); setPage('active'); };
  const endTrip = () => {
    setStarted(false);
    const date = new Date();
    const trip: Trip = { id: Date.now(), date: date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}), start: date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}), end: date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}), minutes: Math.floor(seconds/60), distance: 0, score: 90, speeding: 0, braking: 0, acceleration: 0 };
    setTrips(previous => [trip, ...previous]); setChosen(trip); setPage('history'); setNotice('Demo trip saved for this session. No GPS data was recorded.');
  };
  const openTrip = (trip: Trip) => { setChosen(trip); setPage('details'); };
  
const signIn = async () => {
  if (!email.trim() || !password) {
    setNotice('Please enter your email and password.');
    return;
  }

  if (parent) {
    setNotice('Parent login is not available yet.');
    return;
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    setPassword('');
    setNotice('Login successful!');
    setPage('driver');
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential') {
      setNotice('Incorrect email or password.');
    } else if (error.code === 'auth/too-many-requests') {
      setNotice('Too many attempts. Please try again later.');
    } else {
      setNotice('Login failed. Please try again.');
      console.error(error);
    }
  }
};

  
const register = async () => {
  if (!name.trim()) {
    setNotice('Please enter your full name.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    setNotice('Please enter a valid email address.');
    return;
  }

  if (password.length < 8) {
    setNotice('Password must contain at least 8 characters.');
    return;
  }

  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    await updateProfile(result.user, {
      displayName: name.trim()
    });

    setParent(false);
    setPassword('');
    setNotice('Driver account created successfully!');
    setPage('driver');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      setNotice('This email is already registered.');
    } else if (error.code === 'auth/weak-password') {
      setNotice('Please choose a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      setNotice('Please enter a valid email address.');
    } else {
      setNotice('Registration failed. Please try again.');
      console.error(error);
    }
  }
};

const logout = async () => {
  try {
    await signOut(auth);

    setName('');
    setEmail('');
    setPassword('');
    setParent(false);
    setNotice('Logged out successfully.');
    setPage('login');
  } catch (error) {
    setNotice('Logout failed. Please try again.');
    console.error(error);
  }
};

  const headerData: Record<Page,[string,string]> = {
    login:['Login','Access your driver or parent account'], register:['Driver Registration','Create your driver account'], driver:['Driver Dashboard','Alex Rivera · Driver account'], active:['Active Trip','Alex Rivera · Demo trip in progress'], history:['Trip History','Alex Rivera · Completed trips'], details:['Trip Details','Alex Rivera · Completed trip'], analytics:['Driving Analytics','Alex Rivera · Last 7 days'], links:['Account Linking',parent?'Parent account · Demo access':'Alex Rivera · You control parent access'], parent:['Parent Dashboard','Taylor Rivera · Parent account']
  };
  const isAuth = page === 'login' || page === 'register';
  const [title, subtitle] = headerData[page];
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Checking login...</Text>
      </View>
    );
  }
  
  if (!isAuthenticated && !isAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Please log in to continue.</Text>
        <Button text="Go to Login" onPress={() => setPage('login')} />
      </View>
    );
  }
  return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content"/><View style={styles.appShell}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 26 }} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><Text style={styles.eyebrow}>SMARTPHONE-BASED DRIVER ANALYTICS SYSTEM</Text><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
      {notice ? <Pressable onPress={() => setNotice('')} style={styles.notice}><Text style={styles.muted}>{notice}   ×</Text></Pressable> : null}
      {page === 'login' && <Section><Heading>Welcome back.</Heading><Text style={styles.description}>Log in to view your trips or the driving summaries shared with you.</Text><Field title="Email" value={email} onChange={setEmail} placeholder="you@example.com" /><Field title="Password" value={password} onChange={setPassword} placeholder="Enter your password" secure />
        <View style={{ marginBottom: 16 }}><Text style={styles.label}>Demo account type</Text><View style={styles.choiceRow}><Pressable onPress={() => setParent(false)} style={[styles.choice, !parent && styles.choiceActive]}><Text>Driver</Text></Pressable><Pressable onPress={() => setParent(true)} style={[styles.choice, parent && styles.choiceActive]}><Text>Parent</Text></Pressable></View></View>
        <Button text="Login" onPress={signIn} /><Pressable onPress={() => { setNotice(''); setPage('register'); }}><Text style={styles.centered}>New driver?  <Text style={styles.underlined}>Create an account</Text></Text></Pressable><View style={styles.note}><Text style={styles.noteTitle}>For parents</Text><Text style={styles.muted}>A driver’s approval will be required to access driving information in the planned full system.</Text></View></Section>}
      {page === 'register' && <Section><Heading>Understand your driving.</Heading><Text style={styles.description}>Record trips with your smartphone and review your driving habits.</Text><Field title="Name" value={name} onChange={setName} placeholder="Full name" /><Field title="Email" value={email} onChange={setEmail} placeholder="you@example.com" /><Field title="Password" value={password} onChange={setPassword} placeholder="Create a password" secure /><Text style={[styles.muted,{marginTop:-10,marginBottom:20}]}>Use at least 8 characters.</Text><Button text="Sign Up" onPress={register} /><Pressable onPress={() => { setNotice(''); setPage('login'); }}><Text style={styles.centered}>Already have an account?  <Text style={styles.underlined}>Login</Text></Text></Pressable><View style={styles.note}><Text style={styles.noteTitle}>Your driving information stays yours.</Text><Text style={styles.muted}>Parents can view authorized information only after you approve an account link in the planned system.</Text></View></Section>}
      {page === 'driver' && <Section><Box><Heading>Your driving score</Heading><View style={styles.spaceBetween}><Text style={styles.bigScore}>{score}<Text style={styles.scoreSuffix}> / 100</Text></Text><Text style={styles.muted}>Last 7 days</Text></View><Text style={styles.muted}>{trips.length} completed trips · {totalKm.toFixed(1)} km</Text></Box><View style={{height:20}} /><Button text="Start Trip" onPress={beginTrip} /><Text style={[styles.muted,{marginTop:10}]}>Demo trip timer only. GPS and motion sensors are not recording yet.</Text><View style={[styles.spaceBetween,{marginTop:27,marginBottom:13}]}><Heading>Recent trips</Heading><Text style={styles.underlined} onPress={()=>setPage('history')}>View all</Text></View>{trips.slice(0,3).map(t=><TripRow key={t.id} trip={t} open={()=>openTrip(t)} />)}<Text style={[styles.muted,{marginTop:22}]}>
  Manage who can view your driving information in Links.
</Text>

<View style={{marginTop:20}}>
  <Button text="Logout" outline onPress={logout} />
</View>
</Section>}
      {page === 'active' && <Section><View style={styles.note}><Text style={styles.noteTitle}>●  Recording demo trip</Text></View><View style={styles.timerBlock}><Text style={styles.muted}>Trip duration</Text><Text style={styles.timer}>{displayTime}</Text><Text style={styles.muted}>Hours : Minutes : Seconds</Text></View><Box><Heading>Live trip information</Heading><View style={styles.spaceBetween}><Text style={styles.muted}>Distance traveled</Text><Text>Not tracked</Text></View><View style={styles.rule} /><View style={styles.spaceBetween}><Text style={styles.muted}>GPS & motion sensors</Text><Text>Demo only</Text></View></Box><Text style={[styles.centered,styles.muted]}>Keep your phone secured while driving. End your trip only when safely parked.</Text><Button text="End Trip" onPress={endTrip} /><Text style={[styles.centered,styles.muted]}>Your demo trip will appear in Trip History.</Text></Section>}
      {page === 'history' && <Section><Pressable style={styles.selectRow} onPress={()=>setRange(r=>r==='Last 7 days'?'All trips':'Last 7 days')}><Text>{range}</Text><Text>⌄</Text></Pressable><View style={styles.summary}><View><Text style={styles.summaryNumber}>{trips.length}</Text><Text style={styles.muted}>Completed trips</Text></View><View><Text style={styles.summaryNumber}>{totalKm.toFixed(1)} km</Text><Text style={styles.muted}>Total distance</Text></View></View><View style={[styles.spaceBetween,{marginBottom:12}]}><Heading>{range === 'Last 7 days'?'Oct 27 – Nov 2, 2026':'All demo trips'}</Heading><Text style={styles.muted}>Score</Text></View>{trips.map(t=><TripRow key={t.id} trip={t} open={()=>openTrip(t)} />)}<Text style={[styles.muted,{marginTop:20}]}>Select a trip to review its driving events.</Text></Section>}
      {page === 'details' && <Section><Text onPress={()=>setPage('history')} style={styles.back}>‹ Back to Trip History</Text><Heading>{chosen.date}</Heading><View style={[styles.spaceBetween,{marginVertical:16}]}><View><Text style={styles.muted}>Start time</Text><Text style={styles.label}>{chosen.start}</Text></View><View><Text style={styles.muted}>End time</Text><Text style={styles.label}>{chosen.end}</Text></View></View><View style={[styles.summary,styles.spaceBetween]}><Text><Text style={styles.noteTitle}>{chosen.minutes} min</Text> duration</Text><Text><Text style={styles.noteTitle}>{chosen.distance.toFixed(1)} km</Text> distance</Text></View><Heading>Recorded route</Heading><View style={styles.mapPlaceholder}><Text style={styles.muted}>Map placeholder — no real GPS route</Text><Text style={{fontSize:28,marginTop:20}}>○ ────── ●</Text><Text style={styles.muted}>Start                       End</Text></View><Box><Heading>Trip driving score</Heading><Text style={styles.bigScore}>{chosen.score}<Text style={styles.scoreSuffix}> / 100</Text></Text><View style={styles.track}><View style={[styles.fill,{width:`${chosen.score}%` as `${number}%`}]} /></View></Box><View style={[styles.spaceBetween,{marginTop:24}]}><Heading>Driving events</Heading><Text style={styles.muted}>{chosen.speeding+chosen.braking+chosen.acceleration} total</Text></View><EventRow label="Speeding" count={chosen.speeding} /><EventRow label="Harsh braking" count={chosen.braking} /><EventRow label="Sudden acceleration" count={chosen.acceleration} /></Section>}
      {page === 'analytics' && <Section><Box><Heading>Driving score</Heading><Text style={styles.bigScore}>{score}<Text style={styles.scoreSuffix}> / 100</Text></Text><View style={styles.track}><View style={[styles.fill,{width:`${score}%` as `${number}%`}]} /></View><Text style={styles.muted}>{trips.length} trips · {totalKm.toFixed(1)} km · Demo data</Text></Box><View style={[styles.spaceBetween,{marginTop:25,marginBottom:8}]}><Heading>Driving events</Heading><Text style={styles.muted}>{events.speeding+events.braking+events.acceleration} total</Text></View><EventRow label="Speeding" sub="Above the road speed limit" count={events.speeding} /><EventRow label="Harsh braking" sub="Abrupt decreases in speed" count={events.braking} /><EventRow label="Sudden acceleration" sub="Rapid increases in speed" count={events.acceleration} /><View style={styles.note}><Text style={styles.noteTitle}>How your score is calculated</Text><Text style={styles.muted}>The full system will calculate scores from GPS and motion sensors. All values shown here are sample values.</Text></View></Section>}
      {page === 'links' && <Section><Box><Heading>Send linking request</Heading><Field title="Parent email" value={parentEmail} onChange={setParentEmail} placeholder="parent@example.com" /><Button text="Send Request" onPress={()=>setNotice(parentEmail.includes('@')?'Demo request recorded locally; no email was sent.':'Enter a valid parent email.')} /><Text style={[styles.muted,{marginTop:10}]}>Approved connections will share only permitted driving summaries.</Text></Box><View style={{height:16}} /><Box><View style={styles.spaceBetween}><Heading>Pending request ({pending ? 1 : 0})</Heading><Text style={styles.muted}>NO ACCESS</Text></View>{pending ? <><Text style={styles.label}>Morgan Lee · Parent</Text><Text style={styles.muted}>Wants to link · Awaiting approval</Text><Text style={[styles.muted,{marginVertical:12}]}>Approve to share score, trip summaries and event counts. Reject to share nothing.</Text><View style={styles.choiceRow}><View style={{flex:1}}><Button text="Approve" onPress={()=>{setPending(false);setApproved(true);setNotice('Demo connection approved locally.');}} /></View><View style={{flex:1}}><Button text="Reject" outline onPress={()=>{setPending(false);setNotice('Demo request rejected.');}} /></View></View></> : <Text style={styles.muted}>No pending requests.</Text>}</Box><View style={{height:16}} /><Box><Heading>Approved connection ({approved ? 1 : 0})</Heading>{approved ? <><Text style={styles.label}>Taylor Rivera · Parent</Text><Text style={[styles.muted,{marginVertical:10}]}>Shared: score, trip summaries and event counts. Not shared: live location or raw sensor data.</Text><Button text="Remove Connection" outline onPress={()=>{setApproved(false);setNotice('Demo connection removed locally.');}} /><Text style={[styles.muted,{marginTop:10}]}>Removing ends this simulated parent connection.</Text></> : <Text style={styles.muted}>No approved connections.</Text>}</Box></Section>}
      {page === 'parent' && <Section><View style={styles.spaceBetween}><Heading>Linked drivers (2)</Heading><Text style={styles.underlined} onPress={()=>setPage('links')}>Manage links</Text></View><Text style={[styles.muted,{marginVertical:14}]}>Authorized summaries · Last 7 days · Demo data</Text><Box><View style={styles.spaceBetween}><Heading>Alex Rivera</Heading><Text>Driver approved</Text></View><View style={styles.spaceBetween}><Text style={styles.bigScore}>{score}<Text style={styles.scoreSuffix}> / 100</Text></Text><Text style={styles.muted}>{trips.length} completed trips{'\n'}{totalKm.toFixed(1)} km</Text></View><Text>Latest: Nov 2 · 28 min · 18.4 km</Text><Text style={[styles.muted,{marginTop:8}]}>Speeding {events.speeding} · Braking {events.braking} · Acceleration {events.acceleration}</Text><View style={styles.rule}/><Text style={styles.muted}>Shared by Alex: score, trip summaries and event counts.</Text></Box><View style={{height:16}}/><Box><Heading>Sam Rivera</Heading><View style={styles.spaceBetween}><Text style={styles.bigScore}>91<Text style={styles.scoreSuffix}> / 100</Text></Text><Text style={styles.muted}>4 completed trips{'\n'}62.3 km</Text></View><View style={styles.rule}/><Text style={styles.muted}>Shared by Sam: score and weekly totals only. Trip details and events are not authorized.</Text></Box><View style={styles.note}><Text style={styles.noteTitle}>Driver-controlled access</Text><Text style={styles.muted}>Only approved information is shown. Live location and raw sensor data are not shared.</Text></View><View style={{marginTop:15}}>
  <Button text="Switch account" outline onPress={logout} />
</View>
</Section>}
    </ScrollView>
    {!isAuth && <TabBar page={page} navigate={p=>{setNotice('');setPage(p);}} parent={parent}/>} 
  </View></SafeAreaView>;
}
function TripRow({trip,open}:{trip:Trip;open:()=>void}) {return <Pressable onPress={open} style={styles.tripRow}><View style={{flex:1}}><Text style={styles.tripName}>{trip.date} · {trip.start}</Text><Text style={styles.muted}>{trip.minutes} min · {trip.distance.toFixed(1)} km</Text></View><Text style={styles.tripScore}>{trip.score}<Text style={styles.scoreSuffix}> /100</Text></Text><Text style={styles.chevron}>›</Text></Pressable>;}
function EventRow({label,count,sub}:{label:string;count:number;sub?:string}) {return <View style={styles.eventRow}><View><Text style={styles.tripName}>{label}</Text>{sub&&<Text style={styles.muted}>{sub}</Text>}</View><Text style={styles.eventCount}>{count}</Text></View>;}
const styles = StyleSheet.create({
 safe:{flex:1,backgroundColor:C.white},appShell:{flex:1,width:'100%',maxWidth:470,alignSelf:'center',backgroundColor:C.white,borderColor:'#DEDEDE',borderWidth:1},header:{paddingHorizontal:24,paddingTop:29,paddingBottom:24,borderBottomWidth:1,borderBottomColor:C.line},eyebrow:{fontSize:11,letterSpacing:1.1,color:C.gray,marginBottom:10},title:{fontSize:28,fontWeight:'700',color:C.black},subtitle:{fontSize:14,color:C.gray,marginTop:5},section:{paddingHorizontal:24,paddingTop:24},sectionTitle:{fontSize:19,fontWeight:'700',color:C.black,marginBottom:12},description:{fontSize:16,lineHeight:25,color:C.gray,marginBottom:28},card:{borderWidth:1,borderColor:C.line,borderRadius:4,padding:18},label:{fontSize:15,fontWeight:'500',color:C.black,marginBottom:9},input:{borderWidth:1,borderColor:C.line,borderRadius:4,paddingHorizontal:14,height:49,fontSize:15,color:C.black},button:{backgroundColor:'#353535',borderRadius:4,alignItems:'center',justifyContent:'center',minHeight:50,padding:8},buttonText:{color:C.white,fontWeight:'700',fontSize:16},outlineButton:{borderWidth:1,borderColor:'#353535',backgroundColor:C.white},outlineButtonText:{color:C.black},centered:{textAlign:'center',fontSize:14,marginTop:20,marginBottom:12,color:C.gray,lineHeight:23},underlined:{textDecorationLine:'underline',color:C.black,fontSize:14},muted:{fontSize:14,lineHeight:22,color:C.gray},note:{backgroundColor:C.light,padding:17,marginTop:24},noteTitle:{fontWeight:'700',fontSize:16,color:C.black,marginBottom:6},spaceBetween:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},bigScore:{fontSize:42,fontWeight:'700',color:C.black,marginVertical:14},scoreSuffix:{fontSize:16,color:C.gray,fontWeight:'400'},tripRow:{flexDirection:'row',alignItems:'center',paddingVertical:17,borderBottomWidth:1,borderColor:C.line,gap:9},tripName:{fontSize:15,color:C.black,marginBottom:5},tripScore:{fontSize:23,fontWeight:'700',color:C.black},chevron:{fontSize:25,color:C.gray},tabs:{flexDirection:'row',borderTopWidth:1,borderColor:C.line,paddingHorizontal:8,paddingVertical:7,backgroundColor:C.white},tab:{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:6,borderRadius:5},activeTab:{backgroundColor:'#E8E8E8'},tabSymbol:{fontSize:27,color:C.black},tabLabel:{fontSize:12,color:C.black},timerBlock:{alignItems:'center',paddingVertical:48},timer:{fontSize:49,fontWeight:'500',color:C.black,marginVertical:12},rule:{borderBottomWidth:1,borderColor:C.line,marginVertical:15},summary:{backgroundColor:C.light,padding:20,flexDirection:'row',justifyContent:'space-between',marginVertical:22},summaryNumber:{fontSize:26,fontWeight:'700',color:C.black},selectRow:{borderWidth:1,borderColor:C.line,padding:15,flexDirection:'row',justifyContent:'space-between'},back:{fontSize:16,color:C.black,marginBottom:24},mapPlaceholder:{backgroundColor:C.light,borderWidth:1,borderColor:C.line,height:170,alignItems:'center',justifyContent:'center',marginVertical:14},track:{height:10,backgroundColor:'#E4E4E4',marginVertical:16},fill:{height:'100%',backgroundColor:'#666666'},eventRow:{paddingVertical:21,borderBottomWidth:1,borderColor:C.line,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},eventCount:{fontSize:26,fontWeight:'700',color:C.black},notice:{backgroundColor:'#FFF4DB',padding:12,marginHorizontal:24,marginTop:12},choiceRow:{flexDirection:'row',gap:10},choice:{flex:1,padding:13,borderWidth:1,borderColor:C.line,alignItems:'center'},choiceActive:{backgroundColor:'#E6E6E6',borderColor:C.black}
});
