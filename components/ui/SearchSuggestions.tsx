import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Card from './Card'

interface SearchSuggestionsProps {
  visible: boolean
  recentSearches: string[]
  popularSuggestions: string[]
  onSuggestionPress: (suggestion: string) => void
  onClearHistory: () => void
}

export default function SearchSuggestions(props: SearchSuggestionsProps) {
  if (!props.visible) return null

  return (
    <Card style={styles.container} padding="md">
      {/* Recent Searches */}
      {props.recentSearches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={props.onClearHistory}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.suggestionsRow}>
              {props.recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => props.onSuggestionPress(search)}
                >
                  <Ionicons name="time" size={14} color="#6b7280" />
                  <Text style={styles.suggestionText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Popular Suggestions */}
      {props.popularSuggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.suggestionsRow}>
              {props.popularSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => props.onSuggestionPress(suggestion)}
                >
                  <Ionicons name="trending-up" size={14} color="#3b82f6" />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  clearButton: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  suggestionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
})
