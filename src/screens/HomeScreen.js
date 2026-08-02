import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thrive Education</Text>
        <Text style={styles.subtitle}>Gələcəyinizi bizimlə qurun</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Xoş Gəlmisiniz!</Text>
          <Text style={styles.cardText}>
            Mobil tətbiqimiz vasitəsilə ən son xəbərləri, kursları və xaricdə təhsil fürsətlərini izləyə bilərsiniz.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayLight,
  },
  header: {
    backgroundColor: COLORS.deepNavy,
    padding: SIZES.padding,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    color: COLORS.white,
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.aquaTeal,
    fontSize: SIZES.medium,
    marginTop: 5,
  },
  content: {
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    padding: SIZES.padding,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.deepNavy,
    marginBottom: 10,
  },
  cardText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
