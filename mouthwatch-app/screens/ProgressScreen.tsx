import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const INITIAL_HISTORY = [
  {
    id: '1',
    date: 'Feb 21, 2026',
    color: 'red',
    label: 'High Risk',
    score: 67.6,
    lesion: 'Bottom left cheek',
    annotations: [
      { position: [-0.3, -0.2, 0.4], severity: 'urgent', label: 'Suspicious lesion', note: 'Flagged by MouthWatch — monitor closely' },
      { position: [0.4, -0.1, 0.35], severity: 'watch', label: 'Early cavity', note: 'Early demineralization — review at next visit' },
    ],
  },
  {
    id: '2',
    date: 'Feb 13, 2026',
    color: 'yellow',
    label: 'Moderate Risk',
    score: 45.2,
    lesion: 'Bottom left cheek',
    annotations: [
      { position: [0.2, -0.15, 0.38], severity: 'watch', label: 'Minor irritation', note: 'Watch at next visit' },
    ],
  },
  {
    id: '3',
    date: 'Feb 6, 2026',
    color: 'green',
    label: 'Low Risk',
    score: 22.1,
    lesion: 'Bottom left cheek',
    annotations: [],
  },
];

const COLOR_MAP: Record<string, string> = {
  red: '#ff1744',
  yellow: '#ffea00',
  green: '#00e676',
};

export default function ProgressScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [history, setHistory] = useState(INITIAL_HISTORY);

  useEffect(() => {
    if (route.params?.newScan) {
      setHistory((prev) => [route.params.newScan, ...prev]);
    }
  }, [route.params?.newScan]);

  const trend = history.length >= 2
    ? history[0].score > history[1].score
      ? 'increasing'
      : history[0].score < history[1].score
        ? 'decreasing'
        : 'stable'
    : 'stable';

  const trendConfig = {
    increasing: {
      color: '#ff1744',
      icon: 'trending-up',
      text: 'Your risk has been increasing — consider booking a dentist visit.',
    },
    decreasing: {
      color: '#00e676',
      icon: 'trending-down',
      text: 'Your risk has been decreasing — keep up the good work!',
    },
    stable: {
      color: '#ffea00',
      icon: 'minus',
      text: 'Your risk has been stable. Keep monitoring regularly.',
    },
  }[trend];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0a0f1e', '#0d1f3c']} style={styles.gradient}>
        <Text style={styles.title}>My History</Text>

        {/* Trend Banner */}
        <View style={[styles.trendCard, {
          borderColor: `${trendConfig.color}50`,
          backgroundColor: `${trendConfig.color}15`,
        }]}>
          <Feather name={trendConfig.icon as any} size={18} color={trendConfig.color} />
          <Text style={[styles.trendText, { color: trendConfig.color }]}>
            {trendConfig.text}
          </Text>
        </View>

        {/* 3D Model Button */}
        <TouchableOpacity
          style={styles.modelButton}
          onPress={() => navigation.navigate('ModelViewer', {
            annotations: history[0]?.annotations || [],
            patientName: 'Your',
          })}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['rgba(0,194,255,0.12)', 'rgba(0,114,255,0.06)']}
            style={styles.modelButtonInner}
          >
            <View style={styles.modelIconCircle}>
              <Feather name="box" size={18} color="#00c2ff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modelButtonTitle}>View 3D Mouth Model</Text>
              <Text style={styles.modelButtonSub}>See your annotated scan results</Text>
            </View>
            <Feather name="chevron-right" size={16} color="rgba(0,194,255,0.5)" />
          </LinearGradient>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {history.map((item, index) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.timeline}>
                <View style={[styles.timelineDot, { backgroundColor: COLOR_MAP[item.color] }]} />
                {index < history.length - 1 && <View style={styles.timelineLine} />}
              </View>

              <View style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <View style={[styles.riskBadge, {
                    backgroundColor: `${COLOR_MAP[item.color]}20`,
                    borderColor: `${COLOR_MAP[item.color]}50`,
                  }]}>
                    <Text style={[styles.riskBadgeText, { color: COLOR_MAP[item.color] }]}>
                      {item.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.historyLesion}>{item.lesion}</Text>

                <View style={styles.scoreBar}>
                  <View style={[styles.scoreBarFill, {
                    width: `${item.score}%` as any,
                    backgroundColor: COLOR_MAP[item.color],
                  }]} />
                </View>

                <View style={styles.historyFooter}>
                  <Text style={styles.scoreText}>Score: {item.score}/100</Text>
                  {item.annotations && item.annotations.length > 0 && (
                    <TouchableOpacity
                      style={styles.viewModelBtn}
                      onPress={() => navigation.navigate('ModelViewer', {
                        annotations: item.annotations,
                        patientName: 'Your',
                      })}
                    >
                      <Feather name="box" size={12} color="#00c2ff" />
                      <Text style={styles.viewModelText}>View Model</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* New Scan Button */}
          <TouchableOpacity
            style={styles.newScanButton}
            onPress={() => navigation.navigate('Scan', { screen: 'IntakeForm' })}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00c2ff', '#0072ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.newScanGradient}
            >
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.newScanText}>  New Scan</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  gradient: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  trendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  trendText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  modelButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,194,255,0.2)',
  },
  modelButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  modelIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,194,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,194,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelButtonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00c2ff',
    marginBottom: 2,
  },
  modelButtonSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
  historyItem: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  timeline: { alignItems: 'center', width: 16, paddingTop: 4 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 4,
  },
  historyCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
    gap: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  riskBadgeText: { fontSize: 11, fontWeight: '700' },
  historyLesion: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  scoreBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: { height: 4, borderRadius: 2 },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  viewModelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,194,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,194,255,0.2)',
  },
  viewModelText: {
    fontSize: 11,
    color: '#00c2ff',
    fontWeight: '600',
  },
  newScanButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  newScanGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  newScanText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});