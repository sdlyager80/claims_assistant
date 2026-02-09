// P&C Demo Data - Winter Storm Scenario
// Primary scenario: Maria Rodriguez, Green Petal Florist, Denver winter storm pipe burst

const pcDemoData = [
  {
    id: 'pc-claim-001',
    claimNumber: 'PC-2026-001',
    type: 'commercial_property',
    lineOfBusiness: 'property_casualty',
    subType: 'water_damage',
    status: 'under_review',
    priority: 'high',
    claimant: {
      firstName: 'Maria',
      lastName: 'Rodriguez',
      businessName: 'Green Petal Florist',
      email: 'maria.rodriguez@greenpetalflorist.com',
      phone: '303-555-0142',
      dateOfBirth: '1978-05-12'
    },

    // Loss Event (P&C equivalent of death event)
    lossEvent: {
      eventType: 'winter_storm',
      lossDate: '2026-01-15T03:45:00Z',
      reportedDate: '2026-01-15T07:30:00Z',
      causeOfLoss: 'Frozen Pipe Burst',
      location: {
        address: '1245 Pearl Street',
        city: 'Denver',
        state: 'CO',
        zip: '80203',
        coordinates: { lat: 39.7392, lon: -104.9903 }
      },
      weatherData: {
        temperature: '-5°F',
        conditions: 'Winter Storm Warning',
        windSpeed: '25 mph',
        source: 'NOAA Weather Service',
        alertLevel: 'severe'
      },
      iotSensorData: [
        {
          sensorId: 'TEMP-GPF-001',
          type: 'temperature',
          reading: '-5°F',
          timestamp: '2026-01-15T02:30:00Z',
          alert: 'Critical temperature drop detected',
          status: 'active'
        },
        {
          sensorId: 'WATER-GPF-002',
          type: 'water_leak',
          reading: 'Active leak detected',
          timestamp: '2026-01-15T03:45:00Z',
          alert: 'Water leak detected in storage area',
          status: 'active'
        },
        {
          sensorId: 'HUMID-GPF-003',
          type: 'humidity',
          reading: '85%',
          timestamp: '2026-01-15T04:00:00Z',
          alert: 'Abnormal humidity spike',
          status: 'active'
        }
      ]
    },

    // Property Damage Assessment
    propertyDamage: {
      affectedAreas: ['Storage Room', 'Main Retail Floor', 'Walk-in Cooler', 'Office'],
      damageCategories: [
        {
          category: 'Water Damage',
          severity: 'Major',
          description: 'Extensive water damage from pipe burst affecting walls, flooring, and ceiling',
          estimatedCost: 35000
        },
        {
          category: 'Inventory Loss',
          severity: 'Critical',
          description: 'Complete loss of refrigerated flower inventory and damaged retail displays',
          estimatedCost: 25000
        },
        {
          category: 'Equipment Damage',
          severity: 'Moderate',
          description: 'Walk-in cooler compressor damage, point-of-sale system water damage',
          estimatedCost: 15000
        },
        {
          category: 'Business Interruption',
          severity: 'High',
          description: 'Estimated 2-week closure for repairs and inventory replacement',
          estimatedCost: 12000
        }
      ],
      totalEstimatedLoss: 87000,
      photos: [
        { url: '/images/water-damage-storage.jpg', caption: 'Storage room water damage', timestamp: '2026-01-15T08:00:00Z' },
        { url: '/images/inventory-loss.jpg', caption: 'Damaged flower inventory', timestamp: '2026-01-15T08:15:00Z' }
      ]
    },

    // Intelligent FNOL (First Notice of Loss)
    intelligentFNOL: {
      aiRecommendedActions: [
        'Immediate water mitigation required',
        'Emergency contractor dispatch authorized',
        'Document all damaged inventory with photos',
        'Secure refrigeration units to prevent further loss'
      ],
      riskScore: 28,
      fraudIndicators: [],
      fraudReasoning: 'IoT sensor validation, weather data correlation, timely reporting, and business history support claim authenticity',
      autoApproval: false,
      requiresAdjuster: true,
      straightThroughProcessing: false,
      claimComplexity: 'moderate'
    },

    // Proactive Alerts
    proactiveAlerts: [
      {
        type: 'temperature_warning',
        timestamp: '2026-01-15T02:30:00Z',
        message: 'Critical temperature drop detected at insured location',
        severity: 'high',
        actionTaken: 'Automated notification sent to insured'
      },
      {
        type: 'weather_advisory',
        timestamp: '2026-01-14T18:00:00Z',
        message: 'Winter storm warning issued for Denver area',
        severity: 'medium',
        actionTaken: 'Preventive measures advisory sent'
      }
    ],

    // Financial/Reserve Management (P&C specific)
    financial: {
      claimAmount: 87000,
      initialReserve: 90000,
      currentReserve: 90000,
      policyLimit: 500000,
      deductible: 5000,
      businessInterruptionClaim: 12000,
      totalExposure: 87000,
      paidToDate: 0,
      reserveAdequacy: 'adequate',
      lastReserveUpdate: '2026-01-15T10:00:00Z'
    },

    policy: {
      policyNumber: 'BOP-CO-789456',
      policyType: 'Business Owners Policy',
      carrier: 'Assure Insurance Group',
      effectiveDate: '2023-06-01',
      expirationDate: '2026-06-01',
      premium: 4500,
      coverages: [
        { type: 'Property Damage', limit: 500000, deductible: 5000 },
        { type: 'Business Interruption', limit: 100000, waitingPeriod: '48 hours' },
        { type: 'Equipment Breakdown', limit: 50000, deductible: 1000 }
      ]
    },

    workflow: {
      currentStage: 'adjuster_review',
      assignedTo: 'James Mitchell',
      assignedDate: '2026-01-15T09:00:00Z',
      sla: {
        responseTime: '4 hours',
        resolutionTime: '15 days',
        currentStatus: 'on_track'
      }
    },

    aiInsights: {
      claimSummary: 'Commercial property claim for winter storm-related pipe burst at Green Petal Florist. IoT sensors validated freezing conditions and water leak. Weather data confirms severe winter storm. Low fraud risk with straightforward causation.',
      recommendedActions: [
        'Authorize emergency water mitigation services',
        'Fast-track equipment damage assessment',
        'Coordinate with restoration contractor',
        'Review business interruption coverage timeline'
      ],
      similarClaims: 3,
      averageSettlementTime: '12 days',
      settlementPrediction: '$82,000 - $92,000'
    },

    documents: [
      { id: 'doc-001', type: 'FNOL', name: 'First Notice of Loss', uploadDate: '2026-01-15T07:30:00Z' },
      { id: 'doc-002', type: 'Photos', name: 'Damage Photos', uploadDate: '2026-01-15T08:30:00Z' },
      { id: 'doc-003', type: 'Invoice', name: 'Inventory Loss List', uploadDate: '2026-01-15T10:00:00Z' }
    ],

    timeline: [
      { date: '2026-01-15T02:30:00Z', event: 'IoT temperature alert triggered', actor: 'System' },
      { date: '2026-01-15T03:45:00Z', event: 'Water leak sensor activated', actor: 'System' },
      { date: '2026-01-15T07:30:00Z', event: 'Claim reported via mobile app', actor: 'Maria Rodriguez' },
      { date: '2026-01-15T09:00:00Z', event: 'Claim assigned to adjuster', actor: 'System' },
      { date: '2026-01-15T10:00:00Z', event: 'Initial reserve set', actor: 'James Mitchell' }
    ]
  },

  // Additional P&C Claims for Demo Variety
  {
    id: 'pc-claim-002',
    claimNumber: 'PC-2026-002',
    type: 'auto_collision',
    lineOfBusiness: 'property_casualty',
    subType: 'collision',
    status: 'approved',
    priority: 'medium',
    claimant: {
      firstName: 'David',
      lastName: 'Chen',
      email: 'david.chen@email.com',
      phone: '720-555-0198'
    },
    lossEvent: {
      eventType: 'auto_collision',
      lossDate: '2026-01-10T14:30:00Z',
      reportedDate: '2026-01-10T15:00:00Z',
      causeOfLoss: 'Multi-vehicle collision on I-25',
      location: {
        address: 'I-25 & Arapahoe Road',
        city: 'Centennial',
        state: 'CO',
        zip: '80112'
      }
    },
    propertyDamage: {
      affectedAreas: ['Front bumper', 'Hood', 'Right front fender'],
      damageCategories: [
        { category: 'Body Damage', severity: 'Moderate', estimatedCost: 4500 },
        { category: 'Mechanical', severity: 'Minor', estimatedCost: 1200 }
      ],
      totalEstimatedLoss: 5700
    },
    intelligentFNOL: {
      riskScore: 15,
      fraudIndicators: [],
      autoApproval: true,
      straightThroughProcessing: true,
      aiRecommendedActions: ['Auto-approve claim', 'Schedule repair estimate']
    },
    financial: {
      claimAmount: 5700,
      initialReserve: 6000,
      currentReserve: 5700,
      policyLimit: 100000,
      deductible: 500,
      totalExposure: 5700,
      paidToDate: 5700,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'AUTO-CO-456123',
      policyType: 'Personal Auto',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'payment_issued',
      assignedTo: 'Sarah Williams',
      sla: { currentStatus: 'completed' }
    },
    aiInsights: {
      claimSummary: 'Straightforward auto collision with police report validation. Low complexity, auto-approved for payment.',
      recommendedActions: ['Payment issued', 'Close claim'],
      similarClaims: 145,
      averageSettlementTime: '3 days',
      settlementPrediction: '$5,700'
    }
  },

  {
    id: 'pc-claim-003',
    claimNumber: 'PC-2026-003',
    type: 'homeowners',
    lineOfBusiness: 'property_casualty',
    subType: 'fire_damage',
    status: 'under_review',
    priority: 'high',
    claimant: {
      firstName: 'Jennifer',
      lastName: 'Martinez',
      email: 'j.martinez@email.com',
      phone: '303-555-0176'
    },
    lossEvent: {
      eventType: 'fire',
      lossDate: '2026-01-12T22:00:00Z',
      reportedDate: '2026-01-12T23:30:00Z',
      causeOfLoss: 'Kitchen fire from unattended cooking',
      location: {
        address: '3421 Maple Drive',
        city: 'Boulder',
        state: 'CO',
        zip: '80301'
      }
    },
    propertyDamage: {
      affectedAreas: ['Kitchen', 'Dining Room', 'Living Room'],
      damageCategories: [
        { category: 'Fire Damage', severity: 'Major', estimatedCost: 45000, description: 'Structural damage to kitchen and adjacent areas' },
        { category: 'Smoke Damage', severity: 'Moderate', estimatedCost: 15000, description: 'Smoke damage throughout first floor' },
        { category: 'Water Damage', severity: 'Minor', estimatedCost: 8000, description: 'Fire suppression water damage' }
      ],
      totalEstimatedLoss: 68000
    },
    intelligentFNOL: {
      riskScore: 42,
      fraudIndicators: ['Late night incident', 'High claim amount'],
      autoApproval: false,
      requiresAdjuster: true,
      aiRecommendedActions: ['Assign senior adjuster', 'Request fire marshal report', 'Document all damages with photos']
    },
    financial: {
      claimAmount: 68000,
      initialReserve: 75000,
      currentReserve: 75000,
      policyLimit: 350000,
      deductible: 2500,
      totalExposure: 68000,
      paidToDate: 0,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'HO-CO-789012',
      policyType: 'Homeowners',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'investigation',
      assignedTo: 'Michael Torres',
      sla: { currentStatus: 'at_risk' }
    },
    aiInsights: {
      claimSummary: 'Kitchen fire with moderate fraud indicators. Requires thorough investigation and fire marshal report.',
      recommendedActions: ['Assign investigator', 'Review fire report', 'Schedule adjuster visit'],
      similarClaims: 23,
      averageSettlementTime: '18 days',
      settlementPrediction: '$62,000 - $72,000'
    }
  },

  {
    id: 'pc-claim-004',
    claimNumber: 'PC-2026-004',
    type: 'liability',
    lineOfBusiness: 'property_casualty',
    subType: 'general_liability',
    status: 'pending',
    priority: 'medium',
    claimant: {
      firstName: 'Robert',
      lastName: 'Thompson',
      businessName: 'Thompson Construction LLC',
      email: 'robert@thompsonconstruction.com',
      phone: '303-555-0143'
    },
    lossEvent: {
      eventType: 'property_damage',
      lossDate: '2026-01-08T11:00:00Z',
      reportedDate: '2026-01-09T09:00:00Z',
      causeOfLoss: 'Equipment damage to client property',
      location: {
        address: '5678 Construction Site Ave',
        city: 'Aurora',
        state: 'CO',
        zip: '80015'
      }
    },
    propertyDamage: {
      affectedAreas: ['Underground utilities', 'Landscaping'],
      damageCategories: [
        { category: 'Utility Damage', severity: 'Moderate', estimatedCost: 12000, description: 'Damage to underground utility lines' },
        { category: 'Landscape Restoration', severity: 'Minor', estimatedCost: 3500, description: 'Landscape repair and restoration' }
      ],
      totalEstimatedLoss: 15500
    },
    intelligentFNOL: {
      riskScore: 25,
      fraudIndicators: [],
      autoApproval: false,
      requiresAdjuster: true,
      aiRecommendedActions: ['Verify utility company reports', 'Review contractor insurance']
    },
    financial: {
      claimAmount: 15500,
      initialReserve: 18000,
      currentReserve: 18000,
      policyLimit: 1000000,
      deductible: 1000,
      totalExposure: 15500,
      paidToDate: 0,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'GL-CO-234567',
      policyType: 'General Liability',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'initial_review',
      assignedTo: 'Lisa Anderson',
      sla: { currentStatus: 'on_track' }
    },
    aiInsights: {
      claimSummary: 'General liability claim for construction-related property damage. Standard processing.',
      recommendedActions: ['Review contractor compliance', 'Verify damages with utility company'],
      similarClaims: 67,
      averageSettlementTime: '14 days',
      settlementPrediction: '$15,000 - $17,000'
    }
  },

  {
    id: 'pc-claim-005',
    claimNumber: 'PC-2026-005',
    type: 'auto_comprehensive',
    lineOfBusiness: 'property_casualty',
    subType: 'theft',
    status: 'investigation',
    priority: 'high',
    claimant: {
      firstName: 'Amanda',
      lastName: 'Foster',
      email: 'afoster@email.com',
      phone: '720-555-0182'
    },
    lossEvent: {
      eventType: 'theft',
      lossDate: '2026-01-14T02:00:00Z',
      reportedDate: '2026-01-14T07:30:00Z',
      causeOfLoss: 'Vehicle theft from parking garage',
      location: {
        address: '1500 Parking Garage Lane',
        city: 'Denver',
        state: 'CO',
        zip: '80202'
      }
    },
    propertyDamage: {
      affectedAreas: ['Entire vehicle'],
      damageCategories: [
        { category: 'Total Loss', severity: 'Critical', estimatedCost: 28000, description: '2023 Honda Accord - total loss due to theft' }
      ],
      totalEstimatedLoss: 28000
    },
    intelligentFNOL: {
      riskScore: 65,
      fraudIndicators: ['Late reporting', 'High-value vehicle', 'No witness'],
      autoApproval: false,
      requiresAdjuster: true,
      aiRecommendedActions: ['Initiate fraud investigation', 'Verify police report', 'Check for GPS/tracking data']
    },
    financial: {
      claimAmount: 28000,
      initialReserve: 30000,
      currentReserve: 30000,
      policyLimit: 50000,
      deductible: 1000,
      totalExposure: 28000,
      paidToDate: 0,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'AUTO-CO-567890',
      policyType: 'Personal Auto',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'fraud_investigation',
      assignedTo: 'Detective Services',
      sla: { currentStatus: 'extended' }
    },
    aiInsights: {
      claimSummary: 'Auto theft with elevated fraud indicators. Extended investigation required before settlement.',
      recommendedActions: ['Complete fraud investigation', 'Verify police report authenticity', 'Check for recovery'],
      similarClaims: 12,
      averageSettlementTime: '25 days',
      settlementPrediction: '$27,000 or Denial'
    }
  }
];

export default pcDemoData;
