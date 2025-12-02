package com.dapp.backend.dto.blockchain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainVaccineRecordList {
    private boolean success;
    private Integer count;
    private List<BlockchainVaccineRecordDetails.VaccineRecordDetailData> data;
}
