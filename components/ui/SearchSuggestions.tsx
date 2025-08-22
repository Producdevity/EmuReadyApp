import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Card from './Card'
import { useTheme } from '@/contexts/ThemeContext'

interface SearchSuggestionsProps {
  visible: boolean
  recentSearches: string[]
  popularSuggestions: string[]
  onSuggestionPress: (suggestion: string) => void
  onClearHistory: () => void
}

export default function SearchSuggestions(props: SearchSuggestionsProps) {
  const { theme } = useTheme()
  if (!props.visible) return null

  return (
    <Card style={styles.container} padding="md">
      {/* Recent Searches */}
      {props.recentSearches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Searches</Text>
            <TouchableOpacity onPress={props.onClearHistory}>
              <Text style={[styles.clearButton, { color: theme.colors.primary }]}>Clear</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.suggestionsRow}>
              {props.recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionChip, { backgroundColor: theme.colors.surface }]}
                  onPress={() => props.onSuggestionPress(search)}
                >
                  <Ionicons name="time" size={14} color={theme.colors.textSecondary} />
                  <Text style={[styles.suggestionText, { color: theme.colors.text }]}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Popular Suggestions */}
      {props.popularSuggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Popular Searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.suggestionsRow}>
              {props.popularSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionChip, { backgroundColor: theme.colors.surface }]}
                  onPress={() => props.onSuggestionPress(suggestion)}
                >
                  <Ionicons name="trending-up" size={14} color={theme.colors.primary} />
                  <Text style={[styles.suggestionText, { color: theme.colors.text }]}>{suggestion}</Text>
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
  },
  clearButton: {
    fontSize: 12,
    fontWeight: '500',
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
  },
})
