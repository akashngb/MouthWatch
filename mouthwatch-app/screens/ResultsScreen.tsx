import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Image, ScrollView, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const RISK_CONFIG = {
  green: {
    color: '#00e676',
    bg: 'rgba(0,230,118,0.1)',
    border: 'rgba(0,230,118,0.3)',
    icon: 'check-circle',
    label: 'Low Risk',
  },
  yellow: {
    color: '#ffea00',
    bg: 'rgba(255,234,0,0.1)',
    border: 'rgba(255,234,0,0.3)',
    icon: 'alert-circle',
    label: 'Moderate Risk',
  },
  red: {
    color: '#ff1744',
    bg: 'rgba(255,23,68,0.1)',
    border: 'rgba(255,23,68,0.3)',
    icon: 'alert-triangle',
    label: 'High Risk',
  },
};

export default function ResultsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { result, imageUri } = route.params;

  const config = RISK_CONFIG[result.color as keyof typeof RISK_CONFIG] || RISK_CONFIG.yellow;

  const handleShare = async () => {
    await Share.share({
      message: `MouthWatch Screening Result\n\nRisk Level: ${result.label}\nScore: ${result.combined_score}/100\n\n${result.message}\n\n${result.disclaimer}`,
    });
  };

  const handleSave = () => {
    navigation.navigate('History', {
      newScan: {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        }),
        color: result.color,
        label: result.label,
        score: result.combined_score,
        lesion: 'New scan',
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0a0f1e', '#0d1f3c']} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Feather name="x" size={24} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Results</Text>
            <TouchableOpacity onPress={handleShare}>
              <Feather name="share-2" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          {/* Risk Card */}
          <View style={[styles.riskCard, { backgroundColor: config.bg, borderColor: config.border }]}>
            <Feather name={config.icon as any} size={48} color={config.color} />
            <Text style={[styles.riskLabel, { color: config.color }]}>{result.label}</Text>
            <Text style={styles.riskScore}>{Math.round(result.combined_score)}/100</Text>
            <Text style={styles.riskMessage}>{result.message}</Text>
          </View>

          {/* Image */}
          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <View style={styles.imageOverlay}>
                <View style={[styles.riskDot, { backgroundColor: config.color }]} />
                <Text style={styles.imageLabel}>Analyzed Image</Text>
              </View>
            </View>
          )}

          {/* Breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Score Breakdown</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>ML Image Analysis</Text>
              <Text style={styles.breakdownValue}>{result.ml_confidence?.toFixed(1)}%</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Risk Factor Score</Text>
              <Text style={styles.breakdownValue}>{result.risk_factor_score?.toFixed(1)}/100</Text>
            </View>
          </View>

          {/* Urgency */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recommended Action</Text>
            <View style={styles.urgencyRow}>
              <Feather name="calendar" size={18} color={config.color} />
              <Text style={styles.urgencyText}>{result.urgency}</Text>
            </View>
          </View>

          {/* Save to History */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00c2ff', '#0072ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Feather name="save" size={18} color="#fff" />
              <Text style={styles.saveButtonText}>  Save to My History</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* CTA Buttons */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Find')}
            activeOpacity={0.8}
          >
            <Feather name="map-pin" size={18} color="#00c2ff" />
            <Text style={styles.secondaryButtonText}>  Find a Dentist Near Me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Chat')}
            activeOpacity={0.8}
          >
            <Feather name="message-circle" size={18} color="#00c2ff" />
            <Text style={styles.secondaryButtonText}>  Ask the AI Assistant</Text>
          </TouchableOpacity>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>{result.disclaimer}</Text>

          <View style={{ height: 32 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  gradient: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
  riskCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  riskLabel: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  riskScore: { fontSize: 16, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  riskMessage: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  imageContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    height: 200,
  },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
  imageLabel: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  breakdownValue: { fontSize: 14, color: '#ffffff', fontWeight: '600' },
  urgencyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  urgencyText: { fontSize: 15, color: '#ffffff', fontWeight: '600', flex: 1 },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,194,255,0.08)',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,194,255,0.2)',
    marginBottom: 12,
  },
  secondaryButtonText: { color: '#00c2ff', fontSize: 16, fontWeight: '600' },
  disclaimer: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
});