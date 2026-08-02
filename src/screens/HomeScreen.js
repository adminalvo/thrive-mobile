import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../api/supabase';
import { COLORS, SIZES } from '../constants/theme';

const CATEGORIES = [
  { id: '1', name: 'Bütün Kurslar', icon: 'apps' },
  { id: '2', name: 'Xaricdə Təhsil', icon: 'earth' },
  { id: '3', name: 'Dillər', icon: 'language' },
  { id: '4', name: 'Karyera', icon: 'briefcase' },
];

const POPULAR_COURSES = [
  { id: 'c1', title: 'IELTS İntensiv', rating: 4.8, students: 120, image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80' },
  { id: 'c2', title: 'Karyera Planlaşdırması', rating: 4.9, students: 340, image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80' },
  { id: 'c3', title: 'SAT Hazırlığı', rating: 4.7, students: 85, image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80' },
];

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata) {
        setUserName(user.user_metadata.first_name || 'İstifadəçi');
        
        let role = user.user_metadata.role;
        if (role === 'student') role = 'Şagird';
        else if (role === 'parent') role = 'Valideyn';
        else if (role === 'admin') role = 'Admin';
        
        setUserRole(role);
      }
    };
    fetchUser();
  }, []);

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <Ionicons name={item.icon} size={24} color={COLORS.aquaTeal} />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header / Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Salam, {userName}</Text>
            <Text style={styles.roleTag}>{userRole}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.grayLight} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Kurs axtar..."
            placeholderTextColor="rgba(255,255,255,0.4)"
          />
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kateqoriyalar</Text>
        </View>
        <FlatList
          horizontal
          data={CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Popular Courses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Populyar Kurslar</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>Hamısına bax</Text></TouchableOpacity>
        </View>
        
        {POPULAR_COURSES.map(course => (
          <TouchableOpacity key={course.id} style={styles.courseCard}>
            <Image source={{ uri: course.image }} style={styles.courseImage} />
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <View style={styles.courseStats}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{course.rating}</Text>
                <Text style={styles.studentsText}> • {course.students} tələbə</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepNavy,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  scrollContent: {
    padding: SIZES.padding * 1.5,
    paddingTop: 60, // Space for status bar
    paddingBottom: 100, // Space for bottom tab
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  roleTag: {
    color: COLORS.aquaTeal,
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  notificationBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: SIZES.medium,
    outlineStyle: 'none', // For web
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  seeAllText: {
    color: COLORS.aquaTeal,
    fontSize: SIZES.font,
  },
  categoriesList: {
    paddingBottom: 20,
  },
  categoryCard: {
    backgroundColor: 'rgba(57, 192, 198, 0.1)',
    padding: 15,
    borderRadius: 15,
    marginRight: 15,
    alignItems: 'center',
    width: 100,
    borderWidth: 1,
    borderColor: 'rgba(57, 192, 198, 0.2)',
  },
  categoryText: {
    color: COLORS.white,
    marginTop: 10,
    fontSize: SIZES.small,
    fontWeight: '500',
    textAlign: 'center',
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  courseImage: {
    width: 100,
    height: 100,
  },
  courseInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  courseTitle: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: COLORS.white,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  studentsText: {
    color: COLORS.grayLight,
    fontSize: SIZES.small,
  },
});
