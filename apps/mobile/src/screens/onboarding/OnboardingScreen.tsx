import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
}

const OnboardingScreen: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      title: "Welcome to ScamShieldLite",
      description:
        "Protect yourself from scams and fraud with our advanced detection system.",
    },
    {
      id: 2,
      title: "Real-time Protection",
      description: "Get instant alerts when suspicious activity is detected.",
    },
    {
      id: 3,
      title: "Stay Safe Online",
      description:
        "Your security is our priority. Start protecting yourself today.",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.slideContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, currentSlide === 0 && styles.buttonDisabled]}
          onPress={handlePrevious}
          disabled={currentSlide === 0}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          {currentSlide + 1} / {slides.length}
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            currentSlide === slides.length - 1 && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={currentSlide === slides.length - 1}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  slideContainer: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  pageIndicator: {
    fontSize: 14,
    color: "#666",
  },
});

export default OnboardingScreen;
