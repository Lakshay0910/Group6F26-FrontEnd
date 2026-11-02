import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Screen = 'login' | 'driver' | 'trip' | 'history' | 'parent';
type Trip = { id: number; date: string; duration: string; score: number; distance: string };

const sampleTrips: Trip[] = [
  { id: 1, date: 'Oct 29, 2026', duration: '18 min', score: 92, distance: '8.4 km' },
  { id: 2, date: 'Oct 28, 2026', duration: '25 min', score: 86, distance: '12.1 km' },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [seconds, setSeconds] = useState(0);
  const [trips, setTrips] = useState<Trip[]>(sampleTrips);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => setSeconds(value => value + 1), 1000);
    return () => clearInterval(interval);
  }, [active]);

  const startTrip = () => { setSeconds(0); setActive(true); setScreen('trip'); };
  const endTrip = () => {
    setActive(false);
    const minutes = Math.floor(seconds / 60);
    const nextTrip: Trip = {
      id: Date.now(), date: new Date().toLocaleDateString(),
      duration: `${minutes} min ${seconds % 60} sec`, score: 90,
      distance: 'Demo only',
    };
    setTrips(previous => [nextTrip, ...previous]);
    setScreen('history');
  };
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const Button = ({ title, onPress, secondary = false }: { title: string; onPress: () => void; secondary?: boolean }) => (
    <TouchableOpacity onPress={onPress} style={[styles.button, secondary && styles.secondary]}>
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text>
    </TouchableOpacity>
  );
  const Header = ({ title }: { title: string }) => (
    <View style={styles.header}><Text style={styles.brand}>DRIVEWISE</Text><Text style={styles.heading}>{title}</Text></View>
  );
  const TripCard = ({ trip }: { trip: Trip }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{trip.date}</Text>
      <Text style={styles.muted}>Duration: {trip.duration}  •  Distance: {trip.distance}</Text>
      <Text style={styles.scoreSmall}>Driving score: {trip.score}/100</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        {screen === 'login' && <>
          <View style={styles.welcome}><Text style={styles.logo}>🚘</Text><Text style={styles.hero}>Drive safer, together.</Text><Text style={styles.muted}>A smartphone-based driving analytics prototype</Text></View>
          <Text style={styles.label}>Continue as</Text>
          <Button title="Driver" onPress={() => setScreen('driver')} />
          <Button title="Parent" secondary onPress={() => setScreen('parent')} />
          <Text style={styles.note}>Prototype role selection only — no real login yet.</Text>
        </>}
        {screen === 'driver' && <>
          <Header title="Driver dashboard" />
          <View style={styles.scoreCard}><Text style={styles.muted}>Your latest sample score</Text><Text style={styles.bigScore}>{trips[0]?.score ?? 90}<Text style={styles.outOf}>/100</Text></Text><Text style={styles.good}>Good driving!</Text></View>
          <Text style={styles.section}>Ready for your next trip?</Text>
          <Button title="Start trip" onPress={startTrip} />
          <Button title="View trip history" secondary onPress={() => setScreen('history')} />
          <Button title="Switch account" secondary onPress={() => setScreen('login')} />
        </>}
        {screen === 'trip' && <>
          <Header title="Trip in progress" />
          <View style={styles.scoreCard}><Text style={styles.muted}>Elapsed time</Text><Text style={styles.bigScore}>{clock}</Text><Text style={styles.good}>Trip recording simulation</Text></View>
          <View style={styles.card}><Text style={styles.cardTitle}>Live driving information</Text><Text style={styles.muted}>Speed: Not connected</Text><Text style={styles.muted}>GPS: Not connected</Text><Text style={styles.muted}>Acceleration: Not connected</Text></View>
          <Text style={styles.note}>This prototype measures elapsed time only. GPS and motion sensors will be added in a later sprint.</Text>
          <Button title="End trip & save" onPress={endTrip} />
        </>}
        {screen === 'history' && <>
          <Header title="Trip history" />
          <Text style={styles.muted}>Saved for this demo session (sample data included).</Text>
          {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
          <Button title="Back to dashboard" onPress={() => setScreen('driver')} />
        </>}
        {screen === 'parent' && <>
          <Header title="Parent dashboard" />
          <View style={styles.card}><Text style={styles.cardTitle}>Linked driver: Demo Driver</Text><Text style={styles.muted}>Sample account — linking is not implemented yet.</Text></View>
          <View style={styles.scoreCard}><Text style={styles.muted}>Driver's latest sample score</Text><Text style={styles.bigScore}>{trips[0]?.score ?? 90}<Text style={styles.outOf}>/100</Text></Text><Text style={styles.good}>Recent driving activity</Text></View>
          <Text style={styles.section}>Trips</Text>
          {trips.slice(0, 3).map(trip => <TripCard key={trip.id} trip={trip} />)}
          <Button title="Switch account" secondary onPress={() => setScreen('login')} />
        </>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F8FC' },
  content: { flexGrow: 1, padding: 22, paddingTop: 32, paddingBottom: 48 },
  header: { marginBottom: 24 },
  brand: { color: '#2464B8', fontSize: 13, fontWeight: '800', letterSpacing: 3, marginBottom: 12 },
  heading: { color: '#142C4D', fontSize: 28, fontWeight: '800' },
  welcome: { alignItems: 'center', marginTop: 85, marginBottom: 75 },
  logo: { fontSize: 56, marginBottom: 14 },
  hero: { color: '#142C4D', fontSize: 27, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  label: { fontSize: 17, color: '#142C4D', fontWeight: '700', marginBottom: 14 },
  muted: { color: '#61758F', fontSize: 14, lineHeight: 22, marginTop: 4 },
  button: { backgroundColor: '#2464B8', borderRadius: 12, paddingVertical: 17, paddingHorizontal: 18, marginTop: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  secondary: { backgroundColor: '#E7EFFA', borderWidth: 1, borderColor: '#CCDBEF' },
  secondaryText: { color: '#245A9E' },
  note: { color: '#72829A', fontSize: 12, lineHeight: 19, marginTop: 18 },
  scoreCard: { padding: 24, backgroundColor: '#FFFFFF', borderRadius: 18, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#E4EBF3' },
  bigScore: { fontSize: 58, fontWeight: '800', color: '#2464B8', marginTop: 10 },
  outOf: { fontSize: 20, color: '#7489A3' },
  good: { color: '#188263', fontSize: 15, fontWeight: '700', marginTop: 6 },
  section: { color: '#142C4D', fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  card: { backgroundColor: 'white', borderColor: '#E4EBF3', borderWidth: 1, borderRadius: 14, padding: 18, marginTop: 12, marginBottom: 4 },
  cardTitle: { color: '#142C4D', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  scoreSmall: { color: '#2464B8', fontWeight: '700', marginTop: 10, fontSize: 14 },
});
