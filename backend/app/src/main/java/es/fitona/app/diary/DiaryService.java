package es.fitona.app.diary;

import es.fitona.app.api.DiaryDto;
import es.fitona.app.api.DiaryEntryRequest;
import es.fitona.app.api.ItemRequest;
import es.fitona.app.api.TotalsDto;
import es.fitona.app.calc.NutritionResolver;
import es.fitona.app.calc.ResolvedItem;
import es.fitona.app.catalog.FoodRepository;
import es.fitona.nutrition.NutrientTotals;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@ApplicationScoped
public class DiaryService {

    @Inject
    DiaryRepository repo;

    @Inject
    NutritionResolver resolver;

    @Inject
    FoodRepository foods;

    /** Crea un registro. Con {@code id} repetido de la misma persona devuelve el existente (reintento seguro). */
    @Transactional
    public DiaryDto.EntryDto create(UUID user, DiaryEntryRequest req) {
        LocalDate today = LocalDate.now();
        if (req.date().isBefore(today.minusYears(2)) || req.date().isAfter(today.plusYears(1))) {
            throw new IllegalArgumentException("La fecha está fuera del rango admitido.");
        }
        UUID id = req.id() == null ? UUID.randomUUID() : req.id();
        if (repo.exists(user, id)) return get(user, id);
        if (repo.existsForAnyone(id)) throw new IllegalArgumentException("Identificador no válido.");

        List<ResolvedItem> items = new ArrayList<>();
        for (ItemRequest r : req.items()) items.add(resolver.resolve(user, r));

        boolean allFree = items.stream().allMatch(i -> i.kind().equals("FREE_TEXT"));
        repo.insertEntry(user, id, req.date(), req.mealSlot(), allFree ? "QUICK_NOTE" : "SEARCH", req.note());
        int sort = 0;
        for (ResolvedItem it : items) {
            repo.insertItem(id, ++sort, it);
            if (it.variantId() != null) foods.touchUsage(user, it.variantId(), it.quantity(), it.unitCode(), it.grams());
        }
        return get(user, id);
    }

    public DiaryDto.EntryDto get(UUID user, UUID id) {
        DiaryRepository.StoredEntry e = repo.entry(user, id);
        if (e == null) throw new NotFoundException();
        return build(List.of(e)).get(0);
    }

    public DiaryDto day(UUID user, LocalDate date) {
        List<DiaryRepository.StoredEntry> entries = repo.entriesOn(user, date);
        List<DiaryDto.EntryDto> dtos = build(entries);
        return new DiaryDto(date, dtos, TotalsDto.from(NutrientTotals.sum(allTotals(entries))));
    }

    @Transactional
    public void delete(UUID user, UUID id) {
        if (!repo.softDelete(user, id)) throw new NotFoundException();
    }

    private List<NutrientTotals> allTotals(List<DiaryRepository.StoredEntry> entries) {
        return repo.items(entries.stream().map(DiaryRepository.StoredEntry::id).toList()).stream()
                .map(DiaryRepository.StoredItem::totals).toList();
    }

    private List<DiaryDto.EntryDto> build(List<DiaryRepository.StoredEntry> entries) {
        Map<UUID, List<DiaryRepository.StoredItem>> byEntry = repo.items(entries.stream()
                        .map(DiaryRepository.StoredEntry::id).toList()).stream()
                .collect(Collectors.groupingBy(DiaryRepository.StoredItem::entryId));
        return entries.stream().map(e -> {
            List<DiaryRepository.StoredItem> its = byEntry.getOrDefault(e.id(), List.of());
            List<DiaryDto.ItemDto> itemDtos = its.stream().map(i -> new DiaryDto.ItemDto(i.id(), i.kind(), i.displayName(),
                    i.quantity(), i.unit(), i.grams(), i.servings(), TotalsDto.from(i.totals()))).toList();
            NutrientTotals sum = NutrientTotals.sum(its.stream().map(DiaryRepository.StoredItem::totals).toList());
            return new DiaryDto.EntryDto(e.id(), e.date(), e.slot(), e.note(), itemDtos, TotalsDto.from(sum));
        }).collect(Collectors.toList());
    }

}
