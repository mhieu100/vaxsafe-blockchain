/**
 * NFT Vaccine Passport Service
 * Provides blockchain-based vaccine certificate data with FHIR metadata
 */

// Mock data based on user's blockchain vaccine records
export const mockNFTPassportData = {
  success: true,
  data: [
    {
      // NFT Metadata
      nftId: 'NFT-001',
      tokenId: 1001,
      mintDate: '2025-11-27T08:00:00Z',
      mintedBy: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',

      // Patient Information
      patient: 'Nguyen Van Hieu',
      identityNumber: '012345673901',

      // Vaccine Information
      vaccine: 'STAMARIL phòng bệnh sốt vàng',
      vaccineCode: 'J07BL01', // WHO ATC code
      manufacturer: 'Sanofi Pasteur',

      // Blockchain Data
      transactionHash:
        '0xa9b4d074be99487a940943c16bfbb640356d2d4c2c6c14d54c9bc542d375130f',
      blockNumber: 12345,
      chainId: 1337,

      // Financial Data
      totalAmount: 8319072,
      totalDoses: 3,
      status: 'COMPLETED',
      completionRate: 100,

      // Appointment Details
      appointments: [
        {
          appointmentId: 1,
          doseNumber: 1,
          scheduledDate: '2025-11-27',
          scheduledTime: '08:00:00',
          center: 'VNVC Hoàng Văn Thụ',
          centerAddress: '123 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM',
          cashier: 'Thu ngân Phạm Văn D',
          doctor: 'Bác sĩ Nguyễn Văn A',
          doctorLicense: 'BS-12345',
          status: 'COMPLETED',
          batchNumber: 'VAX-2025-001',
          lotNumber: 'LOT-YF-001',
          expiryDate: '2027-11-01',
        },
        {
          appointmentId: 2,
          doseNumber: 2,
          scheduledDate: '2025-12-17',
          scheduledTime: '08:00:00',
          center: 'VNVC Hoàng Văn Thụ',
          centerAddress: '123 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM',
          cashier: 'Thu ngân Phạm Văn D',
          doctor: 'Bác sĩ Nguyễn Văn A',
          doctorLicense: 'BS-12345',
          status: 'COMPLETED',
          batchNumber: 'VAX-2025-002',
          lotNumber: 'LOT-YF-002',
          expiryDate: '2027-12-01',
        },
        {
          appointmentId: 3,
          doseNumber: 3,
          scheduledDate: '2026-01-06',
          scheduledTime: '08:00:00',
          center: 'VNVC Hoàng Văn Thụ',
          centerAddress: '123 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM',
          cashier: 'Thu ngân Phạm Văn D',
          doctor: 'Bác sĩ Nguyễn Văn A',
          doctorLicense: 'BS-12345',
          status: 'COMPLETED',
          batchNumber: 'VAX-2026-001',
          lotNumber: 'LOT-YF-003',
          expiryDate: '2028-01-01',
        },
      ],

      // FHIR Metadata (HL7 FHIR R4 Standard)
      fhirMetadata: {
        resourceType: 'Immunization',
        id: 'nft-vax-001',
        status: 'completed',
        vaccineCode: {
          coding: [
            {
              system: 'http://hl7.org/fhir/sid/cvx',
              code: '37',
              display: 'Yellow fever vaccine',
            },
          ],
          text: 'STAMARIL phòng bệnh sốt vàng',
        },
        patient: {
          reference: 'Patient/012345673901',
          display: 'Nguyen Van Hieu',
        },
        occurrenceDateTime: '2025-11-27T08:00:00Z',
        recorded: '2025-11-27T08:15:00Z',
        lotNumber: 'LOT-YF-001',
        expirationDate: '2027-11-01',
        site: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActSite',
              code: 'LA',
              display: 'left arm',
            },
          ],
        },
        route: {
          coding: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration',
              code: 'IM',
              display: 'Injection, intramuscular',
            },
          ],
        },
        doseQuantity: {
          value: 0.5,
          unit: 'ml',
          system: 'http://unitsofmeasure.org',
          code: 'ml',
        },
        performer: [
          {
            function: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0443',
                  code: 'AP',
                  display: 'Administering Provider',
                },
              ],
            },
            actor: {
              reference: 'Practitioner/BS-12345',
              display: 'Bác sĩ Nguyễn Văn A',
            },
          },
        ],
        location: {
          reference: 'Location/vnvc-hvt',
          display: 'VNVC Hoàng Văn Thụ',
        },
        manufacturer: {
          display: 'Sanofi Pasteur',
        },
        protocolApplied: [
          {
            doseNumberPositiveInt: 3,
            seriesDosesPositiveInt: 3,
          },
        ],
      },
    },
    {
      // NFT Metadata
      nftId: 'NFT-002',
      tokenId: 1002,
      mintDate: '2025-11-27T08:00:00Z',
      mintedBy: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',

      // Patient Information
      patient: 'Nguyen Van Hieu',
      identityNumber: '012345673901',

      // Vaccine Information
      vaccine: 'MenQuadfi',
      vaccineCode: 'J07AH08',
      manufacturer: 'Sanofi Pasteur',

      // Blockchain Data
      transactionHash:
        '0x8da2c68792014edcc937e6bd34332ff59c73519bd9e7ece108246937946cd5a7',
      blockNumber: 12346,
      chainId: 1337,

      // Financial Data
      totalAmount: 5929008,
      totalDoses: 3,
      status: 'COMPLETED',
      completionRate: 100,

      // Appointment Details
      appointments: [
        {
          appointmentId: 4,
          doseNumber: 1,
          scheduledDate: '2025-11-27',
          scheduledTime: '08:00:00',
          center: 'VNVC Hoàng Văn Thụ',
          centerAddress: '123 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM',
          cashier: 'Thu ngân Phạm Văn D',
          doctor: 'Bác sĩ Nguyễn Văn A',
          doctorLicense: 'BS-12345',
          status: 'COMPLETED',
          batchNumber: 'VAX-2025-MEN-001',
          lotNumber: 'LOT-MEN-001',
          expiryDate: '2027-11-01',
        },
        {
          appointmentId: 5,
          doseNumber: 2,
          scheduledDate: '2025-12-17',
          scheduledTime: '08:00:00',
          center: 'VNVC Hoàng Văn Thụ',
          centerAddress: '123 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM',
          cashier: 'Thu ngân Phạm Văn D',
          doctor: 'Bác sĩ Nguyễn Văn A',
          doctorLicense: 'BS-12345',
          status: 'COMPLETED',
          batchNumber: 'VAX-2025-MEN-002',
          lotNumber: 'LOT-MEN-002',
          expiryDate: '2027-12-01',
        },
        {
          appointmentId: 6,
          doseNumber: 3,
          scheduledDate: '2026-01-06',
          scheduledTime: '08:00:00',
          center: 'VNVC Hoàng Văn Thụ',
          centerAddress: '123 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM',
          cashier: 'Thu ngân Phạm Văn D',
          doctor: 'Bác sĩ Nguyễn Văn A',
          doctorLicense: 'BS-12345',
          status: 'COMPLETED',
          batchNumber: 'VAX-2026-MEN-001',
          lotNumber: 'LOT-MEN-003',
          expiryDate: '2028-01-01',
        },
      ],

      // FHIR Metadata
      fhirMetadata: {
        resourceType: 'Immunization',
        id: 'nft-vax-002',
        status: 'completed',
        vaccineCode: {
          coding: [
            {
              system: 'http://hl7.org/fhir/sid/cvx',
              code: '114',
              display: 'Meningococcal conjugate vaccine',
            },
          ],
          text: 'MenQuadfi',
        },
        patient: {
          reference: 'Patient/012345673901',
          display: 'Nguyen Van Hieu',
        },
        occurrenceDateTime: '2025-11-27T08:00:00Z',
        recorded: '2025-11-27T08:15:00Z',
        lotNumber: 'LOT-MEN-001',
        expirationDate: '2027-11-01',
        site: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActSite',
              code: 'LA',
              display: 'left arm',
            },
          ],
        },
        route: {
          coding: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration',
              code: 'IM',
              display: 'Injection, intramuscular',
            },
          ],
        },
        doseQuantity: {
          value: 0.5,
          unit: 'ml',
          system: 'http://unitsofmeasure.org',
          code: 'ml',
        },
        performer: [
          {
            function: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0443',
                  code: 'AP',
                  display: 'Administering Provider',
                },
              ],
            },
            actor: {
              reference: 'Practitioner/BS-12345',
              display: 'Bác sĩ Nguyễn Văn A',
            },
          },
        ],
        location: {
          reference: 'Location/vnvc-hvt',
          display: 'VNVC Hoàng Văn Thụ',
        },
        manufacturer: {
          display: 'Sanofi Pasteur',
        },
        protocolApplied: [
          {
            doseNumberPositiveInt: 3,
            seriesDosesPositiveInt: 3,
          },
        ],
      },
    },
    {
      // NFT Metadata
      nftId: 'NFT-003',
      tokenId: 1003,
      mintDate: '2025-11-20T08:00:00Z',
      mintedBy: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',

      // Patient Information
      patient: 'Nguyen Van Hieu',
      identityNumber: '012345673901',

      // Vaccine Information
      vaccine: 'Bexsero',
      vaccineCode: 'J07AH09',
      manufacturer: 'GSK',

      // Blockchain Data
      transactionHash:
        '0x82115fdfddb24472c70d8968fb5380c09a2806f1380a7cfc73ba6a52d077ab97',
      blockNumber: 12340,
      chainId: 1337,

      // Financial Data
      totalAmount: 2881626,
      totalDoses: 3,
      status: 'COMPLETED',
      completionRate: 100,

      // Appointment Details
      appointments: [
        {
          appointmentId: 7,
          doseNumber: 1,
          scheduledDate: '2025-11-20',
          scheduledTime: '08:00:00',
          center: 'VNVC Hoàng Văn Thụ',
          centerAddress: '123 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM',
          cashier: 'Thu ngân Phạm Văn D',
          doctor: 'Bác sĩ Nguyễn Văn A',
          doctorLicense: 'BS-12345',
          status: 'COMPLETED',
          batchNumber: 'VAX-2025-BEX-001',
          lotNumber: 'LOT-BEX-001',
          expiryDate: '2027-11-01',
        },
        {
          appointmentId: 8,
          doseNumber: 2,
          scheduledDate: '2025-12-10',
          scheduledTime: '08:00:00',
          center: 'VNVC Hoàng Văn Thụ',
          centerAddress: '123 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM',
          cashier: 'Thu ngân Phạm Văn D',
          doctor: 'Bác sĩ Nguyễn Văn A',
          doctorLicense: 'BS-12345',
          status: 'COMPLETED',
          batchNumber: 'VAX-2025-BEX-002',
          lotNumber: 'LOT-BEX-002',
          expiryDate: '2027-12-01',
        },
        {
          appointmentId: 9,
          doseNumber: 3,
          scheduledDate: '2025-12-30',
          scheduledTime: '08:00:00',
          center: 'VNVC Hoàng Văn Thụ',
          centerAddress: '123 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM',
          cashier: 'Thu ngân Phạm Văn D',
          doctor: 'Bác sĩ Nguyễn Văn A',
          doctorLicense: 'BS-12345',
          status: 'COMPLETED',
          batchNumber: 'VAX-2025-BEX-003',
          lotNumber: 'LOT-BEX-003',
          expiryDate: '2028-01-01',
        },
      ],

      // FHIR Metadata
      fhirMetadata: {
        resourceType: 'Immunization',
        id: 'nft-vax-003',
        status: 'completed',
        vaccineCode: {
          coding: [
            {
              system: 'http://hl7.org/fhir/sid/cvx',
              code: '163',
              display: 'Meningococcal B vaccine',
            },
          ],
          text: 'Bexsero',
        },
        patient: {
          reference: 'Patient/012345673901',
          display: 'Nguyen Van Hieu',
        },
        occurrenceDateTime: '2025-11-20T08:00:00Z',
        recorded: '2025-11-20T08:15:00Z',
        lotNumber: 'LOT-BEX-001',
        expirationDate: '2027-11-01',
        site: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActSite',
              code: 'LA',
              display: 'left arm',
            },
          ],
        },
        route: {
          coding: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration',
              code: 'IM',
              display: 'Injection, intramuscular',
            },
          ],
        },
        doseQuantity: {
          value: 0.5,
          unit: 'ml',
          system: 'http://unitsofmeasure.org',
          code: 'ml',
        },
        performer: [
          {
            function: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0443',
                  code: 'AP',
                  display: 'Administering Provider',
                },
              ],
            },
            actor: {
              reference: 'Practitioner/BS-12345',
              display: 'Bác sĩ Nguyễn Văn A',
            },
          },
        ],
        location: {
          reference: 'Location/vnvc-hvt',
          display: 'VNVC Hoàng Văn Thụ',
        },
        manufacturer: {
          display: 'GSK',
        },
        protocolApplied: [
          {
            doseNumberPositiveInt: 3,
            seriesDosesPositiveInt: 3,
          },
        ],
      },
    },
  ],
};

/**
 * Fetch NFT Passport data (mock implementation)
 * In production, this would call your blockchain service
 */
export const fetchNFTPassport = async (identityNumber) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Filter by identity number if provided
  if (identityNumber) {
    const filteredData = mockNFTPassportData.data.filter(
      (nft) => nft.identityNumber === identityNumber
    );
    return {
      success: true,
      data: filteredData,
    };
  }

  return mockNFTPassportData;
};

/**
 * Get single NFT certificate by ID
 */
export const fetchNFTById = async (nftId) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const nft = mockNFTPassportData.data.find((item) => item.nftId === nftId);

  if (!nft) {
    return {
      success: false,
      message: 'NFT not found',
    };
  }

  return {
    success: true,
    data: nft,
  };
};

/**
 * Format currency (VND)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format blockchain address (short version)
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format transaction hash (short version)
 */
export const formatTxHash = (hash) => {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};

/**
 * Copy to clipboard utility
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Get vaccine color theme
 */
export const getVaccineTheme = (vaccineName) => {
  const themes = {
    STAMARIL: {
      gradient: 'from-yellow-400 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50',
      icon: '💛',
      color: '#f59e0b',
    },
    MenQuadfi: {
      gradient: 'from-blue-400 to-purple-500',
      bgGradient: 'from-blue-50 to-purple-50',
      icon: '💙',
      color: '#3b82f6',
    },
    Bexsero: {
      gradient: 'from-green-400 to-teal-500',
      bgGradient: 'from-green-50 to-teal-50',
      icon: '💚',
      color: '#10b981',
    },
  };

  // Find matching theme
  for (const [key, theme] of Object.entries(themes)) {
    if (vaccineName.includes(key)) {
      return theme;
    }
  }

  // Default theme
  return {
    gradient: 'from-gray-400 to-gray-600',
    bgGradient: 'from-gray-50 to-gray-100',
    icon: '💉',
    color: '#6b7280',
  };
};
