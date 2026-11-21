import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Reward = {
  id: number;
  title: string;
  description: string;
  discount: string;
  requiredScore: number;
};

const DEMO_REWARDS: Reward[] = [
  {
    id: 1,
    title: 'Coffee Shop Reward',
    description: 'Demonstration discount on coffee purchases.',
    discount: '5% OFF',
    requiredScore: 70,
  },
  {
    id: 2,
    title: 'Car Wash Reward',
    description: 'Demonstration discount on a car wash.',
    discount: '10% OFF',
    requiredScore: 80,
  },
  {
    id: 3,
    title: 'Auto Accessories Reward',
    description: 'Demonstration discount on car accessories.',
    discount: '15% OFF',
    requiredScore: 90,
  },
];

type DrivingRewardsProps = {
  drivingScore: number | null;
};

export default function DrivingRewards({
  drivingScore,
}: DrivingRewardsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driving Rewards</Text>
      <Text style={styles.subtitle}>
        Earn rewards by practising safe driving.
      </Text>
      <Text style={styles.notice}>
        Demo rewards only. No actual discounts are available.
      </Text>

      {DEMO_REWARDS.map((reward) => (
  <View key={reward.id} style={styles.rewardCard}>
    <Text style={styles.rewardTitle}>{reward.title}</Text>

    <Text style={styles.discount}>
      {reward.discount}
    </Text>

    <Text style={styles.rewardDescription}>
      {reward.description}
    </Text>

    <Text style={styles.requiredScore}>
      Required Driving Score: {reward.requiredScore}/100
    </Text>

    <Text
  style={[
    styles.eligibility,
    {
      color:
        drivingScore !== null && drivingScore >= reward.requiredScore
          ? '#059669'
          : '#B45309',
    },
  ]}
>
  {drivingScore === null
    ? 'Not enough driving data'
    : drivingScore >= reward.requiredScore
      ? 'Eligible (Demo)'
      : 'Not eligible yet'}
</Text>

  </View>
))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
  },
  notice: {
    fontSize: 13,
    color: '#92400E',
    marginTop: 16,
  },

  rewardCard: {
  backgroundColor: '#F9FAFB',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 12,
  padding: 16,
  marginTop: 16,
},
rewardTitle: {
  fontSize: 17,
  fontWeight: 'bold',
  color: '#1F2937',
},
discount: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#059669',
  marginTop: 8,
},
rewardDescription: {
  fontSize: 14,
  color: '#6B7280',
  marginTop: 8,
},
requiredScore: {
  fontSize: 13,
  color: '#374151',
  marginTop: 10,
  fontWeight: '600',
},

eligibility: {
  fontSize: 14,
  fontWeight: 'bold',
  marginTop: 10,
},

});
