import React, {useMemo, useId} from 'react';
import { wsClient, useConnection } from './connection';
export const Leaderboard = () => {
  const { leaderboardData } = useConnection(); // Access connection context
  const id = useId(); // Generate stable ID prefix

  // Correcting useMemo to properly track and update the player list
  const players = useMemo(() => { // useMemo memoizes the result
    try { // Wrap in try-catch to handle undefined data
      if (!leaderboardData || !Array.isArray(leaderboardData.leaderboard)) { // Check if data is valid
        return []; // Return empty array if no data
      } // End validation

      return leaderboardData.leaderboard.map((player, index) => ({ // Map data to local format
        id: `${id}-${index}`, // Create unique ID for React keys
        name: player.username, // Assign username
        score: player.score // Assign score
      })); // End map
    } catch (error) { // Catch unexpected data structures
      console.error("Leaderboard processing error:", error); // Log error
      return []; // Return empty array as fallback
    } // End try-catch
  }, [leaderboardData]); // Only re-run if these dependencies change
  // Inline styles object following your specific CSS constraints
  const styles = {
    container: {
      display: 'flex', // Enable flex layout
      flexDirection: 'column', // Stack elements vertically
      width: '100%', // Take full width of the screen
      minHeight: '400px', // Minimum height constraint using px
      padding: '1rem', // Padding using rem
      backgroundColor: '#f4f4f4', // Light background color
    },
    header: {
      fontSize: '2rem', // Large font size for title
      textAlign: 'center', // Center the text
      marginBottom: '1.5rem', // Space below the header
    },
    list: {
      display: 'flex', // Use flex for the list container
      flexDirection: 'column', // Column direction for rows
      flexGrow: 1, // Allow the list to expand and fill space
      gap: '0.5rem', // Space between list items
    },
    row: {
      display: 'flex', // Flexbox for row alignment
      justifyContent: 'space-between', // Push name and score to ends
      alignItems: 'center', // Vertically center content
      padding: '1rem', // Internal row spacing
      backgroundColor: '#ffffff', // White background for rows
      borderRadius: '0.5rem', // Rounded corners
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)', // Subtle shadow for depth
    },
    name: {
      fontWeight: 'bold', // Bold font for player names
      fontSize: '1.1rem', // Slightly larger name text
    },
    score: {
      color: '#2a9d8f', // Distinct color for scores
      fontWeight: '600', // Semi-bold score weight
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Global Rankings</h2>
      <div style={styles.list}>
        {players.length ===0 && <p>No players ranked yet. Participate in quizzes to see your name here!</p>}
        {players.length > 0 && players.players.map((player, index) => (
          <div key={player.id} style={styles.row}>
            <span style={styles.name}>
              {index + 1}. {player.name}
            </span>
            <span style={styles.score}>
              {player.score.toLocaleString()} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;